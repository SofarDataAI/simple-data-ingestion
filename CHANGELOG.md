## 2024-04-22

### Added
- Renamed the 'uploadingBucket' property to 's3UnstructuredDataBucket' in the 'DataIngestionStackProps' interface.
- Renamed the 'uploadingBucket' variable to 's3UnstructuredDataBucket' in the 'DataIngestionStack' class constructor.
- Added the 's3UnstructuredDataBucket' property to the 'DataParserStackProps' interface.
- Added the 'DataParserStack' class with the 's3UnstructuredDataBucket' property in the constructor.
- Added the 's3UnstructuredFileUploadQueue' and 's3GoldenDatasetFileUploadQueue' variables in the 'SimpleDataIngestionStack' constructor.
- Added the creation of 'DataParserStack' with the new variables in the constructor.