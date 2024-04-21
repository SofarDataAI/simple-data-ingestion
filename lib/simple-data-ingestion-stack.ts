import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SimpleDataIngestionStackProps } from './SimpleDataIngestionStackProps';

export class SimpleDataIngestionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SimpleDataIngestionStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'SimpleDataIngestionQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
