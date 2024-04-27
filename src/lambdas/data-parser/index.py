import uuid
import json
from loguru import logger

def handler(event, context):
    correlationId = uuid.uuid4()
    method = 'data-parser.handler'
    prefix = f'{correlationId} - {method}'

    logger.debug(f'{prefix} - started.')

    sqs_records = event['Records']
    for sqs_record in sqs_records:
        logger.debug(f'{prefix} - sqs_record: {sqs_record}')
        s3_event = json.loads(sqs_record['body'])
        logger.debug(f'{prefix} - s3_event: {s3_event}')
        # do data chunking and embedding here
    print(event)
    return {
        'statusCode': 200,
        'body': 'Hello from Lambda!'
    }
