import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DataParserStackProps } from './DataParserStackProps';

export class DataParserStack extends cdk.NestedStack {
    constructor(scope: Construct, id: string, props: DataParserStackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
    }
}
