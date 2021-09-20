import AWS from "aws-sdk";
import * as _ from "lodash";

const DEFAULT_LIMIT = 15;
const isOffline = process.env.IS_OFFLINE;
const isTest = process.env.MOCK_DYNAMODB_ENDPOINT;

const config = {
  convertEmptyValues: true,
  ...(isTest && {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    sslEnabled: false,
    region: "local",
  }),
  ...(isOffline && {
    region: "localhost",
    endpoint: "http://localhost:15001",
    accessKeyId: "DEFAULT_ACCESS_KEY",
    secretAccessKey: "DEFAULT_SECRET",
  }),
};

const docClient = new AWS.DynamoDB.DocumentClient(config);

export const insertOrReplace = (tableName: string, item: any) =>
  docClient.put({ TableName: tableName, Item: item }).promise();

export const find = (tableName: string, key: any) => {
  if (key == undefined || key === null) {
    return new Promise((resolve, _) => resolve([]));
  }

  const params = {
    Key: key,
    TableName: tableName,
  };

  return docClient
    .get(params)
    .promise()
    .then((result: any) => (_.isEmpty(result) ? null : result.Item));
};

export const getWhereIdIn = (tableName: string, keys: Array<any>) => {
  if (keys == undefined || keys.length === 0) {
    return new Promise((resolve, _) => resolve([]));
  }

  const params = { RequestItems: { [tableName]: { Keys: keys } } };
  // params.RequestItems[tableName] = { Keys: keys };

  return docClient
    .batchGet(params)
    .promise()
    .then((result: any) => {
      let items;
      if (result.Responses) {
        items = result.Responses[tableName];
      }
      return _.isEmpty(items) ? [] : items;
    });
};

export const list = (
  tableName: string,
  limit?: number,
  nextToken?: any,
  projectionExpression?: string
) => {
  if (!limit) {
    limit = DEFAULT_LIMIT;
  }

  const params: AWS.DynamoDB.DocumentClient.ScanInput = {
    Limit: limit,
    TableName: tableName,
  };
  if (nextToken) {
    params.ExclusiveStartKey = nextToken;
  }
  if (projectionExpression) {
    params.ProjectionExpression = projectionExpression;
  }

  return docClient
    .scan(params)
    .promise()
    .then((result: any) => ({
      nextToken: result.LastEvaluatedKey ? result.LastEvaluatedKey.id : null,
      items: result.Items,
    }));
};

export const query = (
  tableName: string,
  indexName: string,
  attrName: string,
  attrValue: any
) => {
  const params = {
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: `${attrName} = :hkey`,
    ExpressionAttributeValues: { ":hkey": attrValue },
  };

  return docClient
    .query(params)
    .promise()
    .then((result: any) => result.Items);
};

export const update = (tableName: string, key: any, data: any) => {
  const updateExpressions = [];
  const expressionsValues: AWS.DynamoDB.DocumentClient.ExpressionAttributeValueMap =
    {};
  const expressionsNames: AWS.DynamoDB.DocumentClient.ExpressionAttributeNameMap =
    {};

  for (const fieldName of Object.keys(data)) {
    const fieldValue = data[fieldName];
    updateExpressions.push(`#${fieldName} = :${fieldName}`);
    expressionsValues[`:${fieldName}`] = fieldValue;
    expressionsNames[`#${fieldName}`] = fieldName;
  }

  const updateExpression = "set " + updateExpressions.join(", ");
  const params = {
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionsValues,
    ExpressionAttributeNames: expressionsNames,
    ReturnValues: "ALL_NEW",
  };

  return docClient
    .update(params)
    .promise()
    .then((result: any) => ({
      ...result.Attributes,
    }));
};

export const remove = (tableName: string, key: any) => {
  const params = {
    TableName: tableName,
    Key: key,
  };

  return docClient.delete(params).promise();
};
