import type { AWS } from '@serverless/typescript';

import defaultFunction from '@functions/defaultFunction';
import onConnect from '@functions/onConnect';
import onDisconnect from '@functions/onDisconnect';
import sendMessages from '@functions/sendMessages';

const serverlessConfiguration: AWS = {
  service: 'serverless-websocket-chat-api',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-dynamodb-local'],
  provider: {
    name: 'aws',
    region: 'ap-northeast-1',
    runtime: 'nodejs18.x',
    websocketsApiName: 'serverless-websocket-chat-api',
    websocketsApiRouteSelectionExpression: '$request.body.action',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      CUSTOM_AWS_REGION: '${self:provider.region}',
      CONNECTIONS_TABLE_NAME: '${self:resources.Resources.ConnectionsTable.Properties.TableName}',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: [
          'dynamodb:*',
        ],
        Resource: 'arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:resources.Resources.ConnectionsTable.Properties.TableName}',
      },
    ],
  },
  functions: { onConnect, onDisconnect, defaultFunction, sendMessages },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      ConnectionsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'serverlessWebsocketChatConnectionsTable',
          AttributeDefinitions: [
            {
              AttributeName: 'connectionId',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'connectionId',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;