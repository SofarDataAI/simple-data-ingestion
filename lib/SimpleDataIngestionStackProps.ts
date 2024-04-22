import { StackProps } from "aws-cdk-lib";

export interface SimpleDataIngestionStackProps extends StackProps, SimpleDataIngestionBaseStackProps {
    /**
     * The name of the unstructured data bucket.
     */
    readonly unstructuredDataBucketName: string;
    /**
     * The name of the golden dataset bucket.
     */
    readonly goldenDatasetBucketName: string;
    /**
     * The name of the embedding dataset bucket.
     */
    readonly embeddingDatasetBucketName: string;
}

export interface SimpleDataIngestionBaseStackProps {
    /**
     * A prefix used for naming resources to ensure uniqueness across deployments.
     */
    readonly resourcePrefix: string;
    /**
     * The AWS region where resources will be deployed. Can be undefined for default region.
     */
    readonly deployRegion: string | undefined;
    /**
     * The deployment environment (e.g., dev, prod) for resource tagging and logical separation.
     */
    readonly deployEnvironment: string;
    /**
     * The name of the application, used for resource naming and tagging.
     */
    readonly appName: string;
}
