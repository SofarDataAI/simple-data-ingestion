import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { SimpleDataIngestionStackProps } from './SimpleDataIngestionStackProps';

export class SimpleDataIngestionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SimpleDataIngestionStackProps) {
    super(scope, id, props);

    const s3UnstructuredDataBucket = s3.Bucket.fromBucketName(this, `${props.resourcePrefix}-unstructuredDataBucket`, props.unstructuredDataBucketName);
    const s3GoldenDatasetBucket = s3.Bucket.fromBucketName(this, `${props.resourcePrefix}-goldenDatasetBucket`, props.goldenDatasetBucketName);
    const s3EmbeddingDatasetBucket = s3.Bucket.fromBucketName(this, `${props.resourcePrefix}-embeddingDatasetBucket`, props.embeddingDatasetBucketName);
  }
}
