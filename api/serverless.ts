import type { AWS } from '@serverless/typescript';

import defaultFunction from '@functions/defaultFunction';
import onConnect from '@functions/onConnect';
import onDisconnect from '@functions/onDisconnect';
import sendMessage from '@functions/sendMessage';

const serverlessConfiguration: AWS = {
  service: 'websocket-serverless-chat-api',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    region: 'ap-northeast-1',
    runtime: 'nodejs18.x',
    websocketsApiName: 'websocket-serverless-chat-api',
    websocketsApiRouteSelectionExpression: '$request.body.action',

    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  functions: { onConnect, onDisconnect, defaultFunction, sendMessage },
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
};

module.exports = serverlessConfiguration;