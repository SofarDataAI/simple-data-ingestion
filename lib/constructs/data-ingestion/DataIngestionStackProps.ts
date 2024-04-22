import { NestedStackProps } from "aws-cdk-lib";
import * as cdk from 'aws-cdk-lib';
import { SimpleDataIngestionBaseStackProps } from "../../SimpleDataIngestionStackProps";

export interface DataIngestionStackProps extends NestedStackProps, SimpleDataIngestionBaseStackProps {
    readonly uploadingBucket: cdk.aws_s3.IBucket;
}
