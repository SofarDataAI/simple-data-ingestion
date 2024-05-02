import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { DataParserStackProps } from './DataParserStackProps';
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';

export class DataParserStack extends cdk.NestedStack {
    constructor(scope: Construct, id: string, props: DataParserStackProps) {
        super(scope, id, props);

        const s3FileUploadQueue = props.s3UnstructuredFileUploadQueue;
        const s3GoldenDatasetFileUploadQueue = props.s3GoldenDatasetFileUploadQueue;

        const s3UnstructuredDataBucket = props.s3UnstructuredDataBucket;
        const s3GoldenDatasetBucket = props.s3GoldenDatasetBucket;

        const dataParserLambdaFn = new PythonFunction(this, `${props.resourcePrefix}-dataParserLambdaFn`, {
            functionName: `${props.resourcePrefix}-${props.deployRegion}-dataParserLambdaFn`,
            runtime: cdk.aws_lambda.Runtime.PYTHON_3_11,
            entry: path.join(__dirname, '../../../src/lambdas/data-parser'),
            handler: "handler",
            architecture: lambda.Architecture.ARM_64,
            runtimeManagementMode: lambda.RuntimeManagementMode.AUTO,
            memorySize: 1024,
            timeout: cdk.Duration.seconds(60), // 60 seconds
            logRetention: cdk.aws_logs.RetentionDays.ONE_WEEK,
            environment: {
                SQS_SOURCE_QUEUE_URL: s3FileUploadQueue.queueUrl,
                SQS_DESTINATION_QUEUE_URL: s3GoldenDatasetFileUploadQueue.queueUrl,
                S3_BUCKET_NAME: s3GoldenDatasetBucket.bucketName,
            },
            role: new cdk.aws_iam.Role(this, `${props.resourcePrefix}-${props.deployRegion}-dataParserLambdaFn-Role`, {
                assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com'),
                managedPolicies: [
                    cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
                ],
            }),
        });

        // grant permission for dataParserLambdaFn to consume messages from s3FileUploadQueue
        s3FileUploadQueue.grantConsumeMessages(dataParserLambdaFn);

        // grant permission for dataParserLambdaFn to send messages to s3GoldenDatasetFileUploadQueue
        s3GoldenDatasetFileUploadQueue.grantSendMessages(dataParserLambdaFn);

        // grant permission for dataParserLambdaFn to read from s3UnstructuredDataBucket
        s3UnstructuredDataBucket.grantRead(dataParserLambdaFn);

        // grant permission for dataParserLambdaFn to write to s3GoldenDatasetBucket
        s3GoldenDatasetBucket.grantWrite(dataParserLambdaFn);

        // grant permission for textractResultQueue to invoke dataParserLambdaFn
        dataParserLambdaFn.addPermission('AllowSQSInvocation', {
            action: 'lambda:InvokeFunction',
            principal: new iam.ServicePrincipal('sqs.amazonaws.com'),
            sourceArn: s3FileUploadQueue.queueArn,
        });

        // Add the SQS queue as an event source for the dataParserLambdaFn function
        dataParserLambdaFn.addEventSource(new lambdaEventSources.SqsEventSource(s3FileUploadQueue, {
            batchSize: 10, // Set the batch size to 10
            reportBatchItemFailures: true, // Allow functions to return partially successful responses for a batch of records.
            enabled: true,
            maxBatchingWindow: cdk.Duration.seconds(60), // 60 seconds
        }));

        // Configure S3 event notifications to send a message to s3FileUploadQueue when a new object is created
        s3GoldenDatasetBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.SqsDestination(s3FileUploadQueue));
    }
}
