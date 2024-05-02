## 2024-04-29

### Updated
- Updated the `resourcePrefix` in the `stackProps` object to remove the `cdkRegion` variable in `bin/simple-data-ingestion.ts`
- Updated the `entry` and `depsLockFilePath` paths in the `dataIngestionLambdaFn` constructor in `lib/constructs/data-ingestion/data-ingestion-stack.ts`
- Granted read permission to `s3UnstructuredDataBucket` and write permission to `s3GoldenDatasetBucket` for `dataIngestionLambdaFn` in `lib/constructs/data-ingestion/data-ingestion-stack.ts`
- Updated the `entry` path in the `dataParserLambdaFn` constructor in `lib/constructs/data-parser/data-parser-stack.ts`
- Granted read permission to `s3UnstructuredDataBucket` and write permission to `s3GoldenDatasetBucket` for `dataParserLambdaFn` in `lib/constructs/data-parser/data-parser-stack.ts`
- Updated the `s3UnstructuredDataBucket` and `s3GoldenDatasetBucket` variable names in the constructor in `lib/simple-data-ingestion-stack.ts`
- Updated the response body key from `url` to `signedUrl` in `src/lambdas/data-ingestion/index.ts`
- Updated the `APP_NAME`, `UNSTRUCTURED_DATA_BUCKET_NAME`, and `GOLDEN_DATASET_BUCKET_NAME` values in `.env.example`
- Updated the versions of various dependencies in `package-lock.json`
- Updated the versions of various dependencies in `package.json`
- Updated the versions of various dependencies in `src/lambdas/data-ingestion/package-lock.json`
- Updated the versions of various dependencies in `src/lambdas/data-ingestion/package.json`
- Added a new Python file `index.py` for the `data-parser` lambda function in `src/lambdas/data-parser/index.py`
- Updated the versions of various dependencies in `src/lambdas/data-parser/requirements.txt

## 2024-04-22

### Added
- Renamed the 'uploadingBucket' property to 's3UnstructuredDataBucket' in the 'DataIngestionStackProps' interface.
- Renamed the 'uploadingBucket' variable to 's3UnstructuredDataBucket' in the 'DataIngestionStack' class constructor.
- Added the 's3UnstructuredDataBucket' property to the 'DataParserStackProps' interface.
- Added the 'DataParserStack' class with the 's3UnstructuredDataBucket' property in the constructor.
- Added the 's3UnstructuredFileUploadQueue' and 's3GoldenDatasetFileUploadQueue' variables in the 'SimpleDataIngestionStack' constructor.
- Added the creation of 'DataParserStack' with the new variables in the constructor.