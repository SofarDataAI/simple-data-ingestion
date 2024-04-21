#!/usr/bin/env node
import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { Aspects } from 'aws-cdk-lib';
import { ApplyTags } from '../utils/apply-tag';
import { AwsSolutionsChecks } from 'cdk-nag';
import { checkEnvVariables } from '../utils/check-environment-variable';
import { SimpleDataIngestionStack } from '../lib/simple-data-ingestion-stack';
import { SimpleDataIngestionStackProps } from '../lib/SimpleDataIngestionStackProps';

dotenv.config(); // Load environment variables from .env file
const app = new cdk.App();
const appAspects = Aspects.of(app);

// check environment variables
checkEnvVariables('APP_NAME',
'OWNER',
'CDK_DEPLOY_REGION',
'ENVIRONMENT',
'UNSTRUCTURED_DATA_BUCKET_NAME',
'GOLDEN_DATASET_BUCKET_NAME',
'EMBEDDING_DATASET_BUCKET_NAME',
);

const { CDK_DEFAULT_ACCOUNT: account, CDK_DEFAULT_REGION: region } = process.env;

const cdkRegion = process.env.CDK_DEPLOY_REGION!;
const deployEnvironment = process.env.ENVIRONMENT!;

const appName = process.env.APP_NAME!;
const owner = process.env.OWNER!;
const unstructuredDataBucketName = process.env.UNSTRUCTURED_DATA_BUCKET_NAME!;
const goldenDatasetBucketName = process.env.GOLDEN_DATASET_BUCKET_NAME!;
const embeddingDatasetBucketName = process.env.EMBEDDING_DATASET_BUCKET_NAME!;

// apply tags to all resources
appAspects.add(new ApplyTags({
  environment: deployEnvironment as 'development' | 'staging' | 'production' | 'demonstration',
  project: appName,
  owner: owner,
}));

// security check
appAspects.add(new AwsSolutionsChecks());

const stackProps: SimpleDataIngestionStackProps = {
  resourcePrefix: `${appName}-${deployEnvironment}`,
  env: {
    region: cdkRegion,
    account,
  },
  deployRegion: cdkRegion,
  deployEnvironment,
  appName,
  unstructuredDataBucketName,
  goldenDatasetBucketName,
  embeddingDatasetBucketName,
};
new SimpleDataIngestionStack(app, `SimpleDataIngestionStack`, {
  ...stackProps,
  stackName: `${appName}-${deployEnvironment}-${cdkRegion}-SimpleDataIngestionStack`,
  description: `SimpleDataIngestionStack for ${appName} in ${cdkRegion} ${deployEnvironment}.`,
});

app.synth();
