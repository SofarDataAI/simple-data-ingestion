import * as cdk from "aws-cdk-lib";
import * as path from "path";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NestedStack } from "aws-cdk-lib";
import { DataIngestionStackProps } from "./DataIngestionStackProps";
import { Construct } from "constructs";
import { LlrtFunction } from "cdk-lambda-llrt";
import { OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";

/**
 * Represents a nested stack for data ingestion functionalities.
 * This stack includes resources like Lambda functions and associated roles and permissions.
 *
 * @param {Construct} scope - The scope in which to define this construct.
 * @param {string} id - The scoped construct ID.
 * @param {DataIngestionStackProps} props - The properties for the data ingestion stack.
 */
export class DataIngestionStack extends NestedStack {
  constructor(scope: Construct, id: string, props: DataIngestionStackProps) {
    super(scope, id, props);

    const uploadingBucket = props.uploadingBucket;

    const dataIngestionLambdaFn = new LlrtFunction(this, `${props.resourcePrefix}-dataIngestionLambdaFn`, {
      functionName: `${props.resourcePrefix}-dataIngestionLambdaFn`,
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../src/lambdas/data-ingestion/index.ts'),
      handler: 'handler',
      environment: {
          S3_BUCKET_NAME: uploadingBucket.bucketName,
      },
      llrtVersion: 'latest',
      role: new cdk.aws_iam.Role(this, `${props.resourcePrefix}-dataIngestionLambdaFn-Role`, {
          assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com'),
          managedPolicies: [
              cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
          ],
      }),
      timeout: cdk.Duration.seconds(60), // 60 seconds
      architecture: lambda.Architecture.ARM_64,
      logGroup: new cdk.aws_logs.LogGroup(this, `${props.resourcePrefix}-dataIngestionLambdaFn-LogGroup`, {
          logGroupName: `${props.resourcePrefix}-dataIngestionLambdaFn-LogGroup`,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          retention: cdk.aws_logs.RetentionDays.ONE_WEEK,
      }),
      memorySize: 1024,
      bundling: {
          minify: true,
          sourceMap: true,
          sourcesContent: false,
          esbuildVersion: '0.20.2',
          target: 'es2020',
          format: OutputFormat.ESM,
          forceDockerBundling: true,
      },
      awsSdkConnectionReuse: false, // https://speedrun.nobackspacecrew.com/blog/2024/03/13/lambda-environment-variables-impact-on-coldstarts.html#does-it-impact-you
      projectRoot: path.join(__dirname, '../src/lambdas/data-ingestion'),
      depsLockFilePath: path.join(__dirname, '../src/lambdas/data-ingestion/package-lock.json'),
    });

    // grant permissions to the lambda function
    uploadingBucket.grantWrite(dataIngestionLambdaFn);

    const dataIngestionLambdaFnUrl = new cdk.aws_lambda.FunctionUrl(this, `${props.resourcePrefix}-${props.deployRegion}-dataIngestionLambdaFn-Url`, {
      function: dataIngestionLambdaFn,
      invokeMode: cdk.aws_lambda.InvokeMode.BUFFERED,
      cors: {
          allowedOrigins: ['*'],
          allowedMethods: [lambda.HttpMethod.POST],
          allowedHeaders: ['*'],
          allowCredentials: true,
      },
      authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
    });

    // export the URL of the Lambda Function
    new cdk.CfnOutput(this, `${props.resourcePrefix}-${props.deployRegion}-dataIngestionLambdaFn-Url-Export`, {
      value: dataIngestionLambdaFnUrl.url,
      exportName: `${props.resourcePrefix}-${props.deployRegion}-dataIngestionLambdaFn-Url-Export`,
      description: `The URL of the data ingestion lambda function.`,
    });
  }
}
