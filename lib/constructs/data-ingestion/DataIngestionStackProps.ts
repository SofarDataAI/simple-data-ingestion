import { NestedStackProps } from "aws-cdk-lib";
import * as cdk from 'aws-cdk-lib';
import { SimpleDataIngestionBaseStackProps } from "../../SimpleDataIngestionStackProps";

export interface DataIngestionStackProps extends NestedStackProps, SimpleDataIngestionBaseStackProps {
    readonly s3UnstructuredDataBucket: cdk.aws_s3.IBucket;
}
