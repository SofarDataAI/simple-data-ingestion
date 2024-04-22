import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { SimpleDataIngestionStackProps } from './SimpleDataIngestionStackProps';
import { DataIngestionStack } from './constructs/data-ingestion/data-ingestion-stack';
import { DataParserStack } from './constructs/data-parser/data-parser-stack';

export class SimpleDataIngestionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SimpleDataIngestionStackProps) {
    super(scope, id, props);

    const s3UnstructuredDataBucket = s3.Bucket.fromBucketName(this, `${props.resourcePrefix}-unstructuredDataBucket`, props.unstructuredDataBucketName);
    const s3GoldenDatasetBucket = s3.Bucket.fromBucketName(this, `${props.resourcePrefix}-goldenDatasetBucket`, props.goldenDatasetBucketName);
    const s3EmbeddingDatasetBucket = s3.Bucket.fromBucketName(this, `${props.resourcePrefix}-embeddingDatasetBucket`, props.embeddingDatasetBucketName);

    const s3UnstructuredFileUploadQueue = new sqs.Queue(this, `${props.resourcePrefix}-s3UnstructuredFileUploadQueue`, {
        visibilityTimeout: cdk.Duration.seconds(60), // 60 seconds
        queueName: `${props.resourcePrefix}-s3UnstructuredFileUploadQueue`,
        encryption: sqs.QueueEncryption.SQS_MANAGED,
        retentionPeriod: cdk.Duration.days(3), // 3 days
        removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const s3GoldenDatasetFileUploadQueue = new sqs.Queue(this, `${props.resourcePrefix}-s3GoldenDatasetFileUploadQueue`, {
        visibilityTimeout: cdk.Duration.seconds(60), // 60 seconds
        queueName: `${props.resourcePrefix}-s3GoldenDatasetFileUploadQueue`,
        encryption: sqs.QueueEncryption.SQS_MANAGED,
        retentionPeriod: cdk.Duration.days(3), // 3 days
        removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new DataIngestionStack(this, `${props.resourcePrefix}-DataIngestionStack`, {
        ...props,
        s3UnstructuredDataBucket: s3UnstructuredDataBucket,
    });

    new DataParserStack(this, `${props.resourcePrefix}-DataParserStack`, {
        ...props,
        s3UnstructuredDataBucket: s3UnstructuredDataBucket,
        s3GoldenDatasetBucket: s3GoldenDatasetBucket,
        s3UnstructuredFileUploadQueue: s3UnstructuredFileUploadQueue,
        s3GoldenDatasetFileUploadQueue: s3GoldenDatasetFileUploadQueue,
    });
  }
}
