declare module NodeJS {
    interface ProcessEnv {
        [key: string]: string | undefined;
        /**
         * The regions where the CDK application will be deployed.
         */
        CDK_DEPLOY_REGION: string;
        /**
         * A comma-separated list of environments for the application, e.g., "dev,prod".
         */
        ENVIRONMENT: string;
        /**
         * The owner of the application.
         */
        OWNER: string;
        UNSTRUCTURED_DATA_BUCKET_NAME: string;
        GOLDEN_DATASET_BUCKET_NAME: string;
        EMBEDDING_DATASET_BUCKET_NAME: string;
    }
}
