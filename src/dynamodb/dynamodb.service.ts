import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  DynamoDBClient,
  PutItemCommand,
  CreateTableCommand,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DynamoDBService {
  private dynamoDBClient: DynamoDBClient;

  constructor(private readonly configService: ConfigService) {
    this.dynamoDBClient = new DynamoDBClient({
      region: this.config('AWS_REGION'),
      credentials: {
        accessKeyId: this.config('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config('AWS_SECRET_ACCESS_KEY'),
        sessionToken: this.config('AWS_SESSION_TOKEN'),
      },
      endpoint: `http://${this.config('DYNAMO_DB_HOSTNAME')}:${this.config('DYNAMO_DB_PORT')}`,
    });
  }

  config(key: string) {
    return this.configService.get(key);
  }

  async initializeTables() {
    await this.createTable(
      this.config('DYNAMO_DB_USERS_TABLE'),
      [
        { AttributeName: 'id', KeyType: 'HASH' },
        { AttributeName: 'user_id', KeyType: 'RANGE' },
      ],
      [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'user_id', AttributeType: 'N' },
      ],
    );

    await this.createTable(
      this.config('DYNAMO_DB_BOOKS_TABLE'),
      [
        { AttributeName: 'id', KeyType: 'HASH' },
        { AttributeName: 'user_id', KeyType: 'RANGE' },
      ],
      [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'user_id', AttributeType: 'N' },
      ],
    );
  }

  private async createTable(
    tableName: string,
    keySchema: { AttributeName: string; KeyType: string }[],
    attributeDefinitions: { AttributeName: string; AttributeType: string }[],
  ) {
    try {
      const listTablesCommand = new ListTablesCommand({});
      const tables = await this.dynamoDBClient.send(listTablesCommand);

      if (tables.TableNames?.includes(tableName)) {
        console.log(`Table "${tableName}" already exists.`);
        return;
      }

      const createParams = {
        TableName: tableName,
        KeySchema: keySchema as any,
        AttributeDefinitions: attributeDefinitions as any,
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      };

      const createTableCommand = new CreateTableCommand(createParams);
      await this.dynamoDBClient.send(createTableCommand);

      console.log(`Table "${tableName}" created successfully.`);
    } catch (error) {
      console.error(`Error creating table "${tableName}":`, error);
    }
  }

  async writeLogs(
    tableName: string,
    logData: {
      user_id?: number;
      role_id?: number;
      signin_date?: string;
      logout_date?: string;
      book_id?: number;
      event?: string;
      event_date?: string;
      data?: object;
    },
  ) {
    const params = {
      TableName: tableName,
      Item: {
        id: { S: uuidv4() },
        user_id: logData.user_id ? { N: logData.user_id.toString() } : undefined,
        role_id: logData.role_id ? { N: logData.role_id.toString() } : undefined,
        signin_date: logData.signin_date ? { S: logData.signin_date } : undefined,
        logout_date: logData.logout_date ? { S: logData.logout_date } : null,
        book_id: logData.book_id ? { N: logData.book_id.toString() } : undefined,
        event: logData.event ? { S: logData.event } : undefined,
        eventDate:  logData.event_date ? { S: logData.signin_date } : undefined,
        data: logData.data ? { S: JSON.stringify(logData.data) } : null,
      },
    };

    try {
      for (const key in params.Item) {
        if (params.Item[key] === undefined) delete params.Item[key];
      }

      await this.dynamoDBClient.send(new PutItemCommand(params));
      console.log(`Log written to "${tableName}" successfully.`);
    } catch (error) {
      console.error(`Error writing log to "${tableName}":`, error);
    }
  }

}
