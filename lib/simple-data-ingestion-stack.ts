import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { SimpleDataIngestionStackProps } from './SimpleDataIngestionStackProps';
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';

export class SimpleDataIngestionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SimpleDataIngestionStackProps) {
    super(scope, id, props);

    const s3UnstructuredDataBucket = s3.Bucket.fromBucketName(this, `${props.resourcePrefix}-unstructuredDataBucket`, props.unstructuredDataBucketName);
    const s3GoldenDatasetBucket = s3.Bucket.fromBucketName(this, `${props.resourcePrefix}-goldenDatasetBucket`, props.goldenDatasetBucketName);
    const s3EmbeddingDatasetBucket = s3.Bucket.fromBucketName(this, `${props.resourcePrefix}-embeddingDatasetBucket`, props.embeddingDatasetBucketName);

    // lambda function to start a Textract job for analyzing tables in a document (Python version)
    const textAnalysisLambdaFn = new PythonFunction(this, `${props.resourcePrefix}-textAnalysisLambdaFn`, {
      functionName: `${props.resourcePrefix}-textAnalysisLambdaFn`,
      runtime: cdk.aws_lambda.Runtime.PYTHON_3_11,
      entry: path.join(__dirname, '../src/lambdas/textract-table-analysis/py-create-request-queue'),
      handler: "handler",
      architecture: lambda.Architecture.ARM_64,
      runtimeManagementMode: lambda.RuntimeManagementMode.AUTO,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(60), // 60 seconds
      logRetention: cdk.aws_logs.RetentionDays.ONE_WEEK,
      environment: {
          TEXTRACT_RESULT_QUEUE_URL: textAnalysisResultQueue.queueUrl,
          TEXTRACT_QUEUE_URL: textAnalysisQueue.queueUrl,
          TEXTRACT_FEATURE_TYPES: props.TEXTRACT_FEATURE_TYPES,
      },
      role: new cdk.aws_iam.Role(this, `${props.resourcePrefix}-textAnalysisLambdaFn-Role`, {
          assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com'),
          managedPolicies: [
              cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
          ],
          inlinePolicies: {
              // define the role for listObject, putObject, and deleteObject permissions from s3TextCachedBucket
              s3PdfCachedBucketPolicy: new cdk.aws_iam.PolicyDocument({
                  statements: [
                      new cdk.aws_iam.PolicyStatement({
                          actions: ['s3:ListBucket'],
                          resources: [s3PdfCachedBucket.bucketArn],
                      }),
                      new cdk.aws_iam.PolicyStatement({
                          actions: ['s3:GetObject'],
                          resources: [`${s3PdfCachedBucket.bucketArn}/*`],
                      }),
                      new cdk.aws_iam.PolicyStatement({
                          actions: ['s3:GetObjectAcl'],
                          resources: [`${s3PdfCachedBucket.bucketArn}/*`],
                      }),
                      new cdk.aws_iam.PolicyStatement({
                          actions: ['s3:GetObjectTagging'],
                          resources: [`${s3PdfCachedBucket.bucketArn}/*`],
                      }),
                      new cdk.aws_iam.PolicyStatement({
                          actions: ['s3:GetObjectVersion'],
                          resources: [`${s3PdfCachedBucket.bucketArn}/*`],
                      }),
                      new cdk.aws_iam.PolicyStatement({
                          actions: ['s3:GetObjectVersionAcl'],
                          resources: [`${s3PdfCachedBucket.bucketArn}/*`],
                      }),
                      new cdk.aws_iam.PolicyStatement({
                          actions: ['s3:GetObjectVersionTagging'],
                          resources: [`${s3PdfCachedBucket.bucketArn}/*`],
                      }),
                      new cdk.aws_iam.PolicyStatement({
                          actions: ['textract:AnalyzeDocument', 'textract:StartDocumentAnalysis', 'textract:StartDocumentTextDetection'],
                          resources: ['*'], // Assuming Textract does not support resource-level permissions
                      }),
                  ],
              }),
              // define textAnalysisQueuePolicy to grant this lambda function to read and delete message from textAnalysisQueue
              textAnalysisQueuePolicy: new cdk.aws_iam.PolicyDocument({
                  statements: [
                      new cdk.aws_iam.PolicyStatement({
                          actions: ['sqs:ReceiveMessage'],
                          resources: [textAnalysisQueue.queueArn],
                      }),
                      new cdk.aws_iam.PolicyStatement({
                          actions: ['sqs:ChangeMessageVisibility', 'sqs:GetQueueAttributes', 'sqs:GetQueueUrl'],
                          resources: [textAnalysisQueue.queueArn],
                      }),
                      new cdk.aws_iam.PolicyStatement({
                          actions: ['sqs:DeleteMessage'],
                          resources: [textAnalysisQueue.queueArn],
                      }),
                      new cdk.aws_iam.PolicyStatement({
                          actions: ['sqs:SendMessage'],
                          resources: [textAnalysisQueue.queueArn],
                      }),
                  ],
              }),
              // define textAnalysisResultQueuePolicy to grant this lambda function to read, write and delete message from textAnalysisResultQueue
              textAnalysisResultQueuePolicy: new cdk.aws_iam.PolicyDocument({
                  statements: [
                      new cdk.aws_iam.PolicyStatement({
                          actions: ['sqs:ReceiveMessage'],
                          resources: [textAnalysisResultQueue.queueArn],
                      }),
                      new cdk.aws_iam.PolicyStatement({
                          actions: ['sqs:DeleteMessage'],
                          resources: [textAnalysisResultQueue.queueArn],
                      }),
                      new cdk.aws_iam.PolicyStatement({
                          actions: ['sqs:SendMessage'],
                          resources: [textAnalysisResultQueue.queueArn],
                      }),
                      new cdk.aws_iam.PolicyStatement({
                          actions: ['sqs:ChangeMessageVisibility', 'sqs:GetQueueAttributes', 'sqs:GetQueueUrl'],
                          resources: [textAnalysisResultQueue.queueArn],
                      }),
                  ],
              }),
          },
      }),
    });
  }
}
