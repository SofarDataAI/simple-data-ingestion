import { NestedStackProps } from "aws-cdk-lib";
import * as cdk from 'aws-cdk-lib';
import { SimpleDataIngestionBaseStackProps } from "../../SimpleDataIngestionStackProps";

export interface DataParserStackProps extends NestedStackProps, SimpleDataIngestionBaseStackProps {
    readonly s3UnstructuredDataBucket: cdk.aws_s3.IBucket;
    readonly s3GoldenDatasetBucket: cdk.aws_s3.IBucket;
}
