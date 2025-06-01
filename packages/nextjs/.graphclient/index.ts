// @ts-nocheck
import { GraphQLResolveInfo, SelectionSetNode, FieldNode, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { gql } from '@graphql-mesh/utils';

import type { GetMeshOptions } from '@graphql-mesh/runtime';
import type { YamlConfig } from '@graphql-mesh/types';
import { PubSub } from '@graphql-mesh/utils';
import { DefaultLogger } from '@graphql-mesh/utils';
import MeshCache from "@graphql-mesh/cache-localforage";
import { fetch as fetchFn } from '@whatwg-node/fetch';

import { MeshResolvedSource } from '@graphql-mesh/runtime';
import { MeshTransform, MeshPlugin } from '@graphql-mesh/types';
import GraphqlHandler from "@graphql-mesh/graphql"
import BareMerger from "@graphql-mesh/merger-bare";
import { printWithCache } from '@graphql-mesh/utils';
import { usePersistedOperations } from '@graphql-yoga/plugin-persisted-operations';
import { createMeshHTTPHandler, MeshHTTPHandler } from '@graphql-mesh/http';
import { getMesh, ExecuteMeshFn, SubscribeMeshFn, MeshContext as BaseMeshContext, MeshInstance } from '@graphql-mesh/runtime';
import { MeshStore, FsStoreStorageAdapter } from '@graphql-mesh/store';
import { path as pathModule } from '@graphql-mesh/cross-helpers';
import { ImportFn } from '@graphql-mesh/types';
import type { YourContractTypes } from './sources/YourContract/types';
import * as importedModule$0 from "./sources/YourContract/introspectionSchema";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };



/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: any; output: any; }
  BigInt: { input: any; output: any; }
  Bytes: { input: any; output: any; }
  Int8: { input: any; output: any; }
  Timestamp: { input: any; output: any; }
};

export type Aggregation_interval =
  | 'hour'
  | 'day';

export type Bid = {
  id: Scalars['ID']['output'];
  request: Request;
  bidIndex: Scalars['BigInt']['output'];
  bidderCommitment: Scalars['Bytes']['output'];
  encryptedBidMetadataCID: Scalars['String']['output'];
  timestamp: Scalars['BigInt']['output'];
  isAccepted: Scalars['Boolean']['output'];
  userIdentifier: Scalars['Bytes']['output'];
  encryptedKey?: Maybe<Scalars['String']['output']>;
};

export type Bid_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  request?: InputMaybe<Scalars['String']['input']>;
  request_not?: InputMaybe<Scalars['String']['input']>;
  request_gt?: InputMaybe<Scalars['String']['input']>;
  request_lt?: InputMaybe<Scalars['String']['input']>;
  request_gte?: InputMaybe<Scalars['String']['input']>;
  request_lte?: InputMaybe<Scalars['String']['input']>;
  request_in?: InputMaybe<Array<Scalars['String']['input']>>;
  request_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  request_contains?: InputMaybe<Scalars['String']['input']>;
  request_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  request_not_contains?: InputMaybe<Scalars['String']['input']>;
  request_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  request_starts_with?: InputMaybe<Scalars['String']['input']>;
  request_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  request_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  request_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  request_ends_with?: InputMaybe<Scalars['String']['input']>;
  request_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  request_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  request_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  request_?: InputMaybe<Request_filter>;
  bidIndex?: InputMaybe<Scalars['BigInt']['input']>;
  bidIndex_not?: InputMaybe<Scalars['BigInt']['input']>;
  bidIndex_gt?: InputMaybe<Scalars['BigInt']['input']>;
  bidIndex_lt?: InputMaybe<Scalars['BigInt']['input']>;
  bidIndex_gte?: InputMaybe<Scalars['BigInt']['input']>;
  bidIndex_lte?: InputMaybe<Scalars['BigInt']['input']>;
  bidIndex_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  bidIndex_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  bidderCommitment?: InputMaybe<Scalars['Bytes']['input']>;
  bidderCommitment_not?: InputMaybe<Scalars['Bytes']['input']>;
  bidderCommitment_gt?: InputMaybe<Scalars['Bytes']['input']>;
  bidderCommitment_lt?: InputMaybe<Scalars['Bytes']['input']>;
  bidderCommitment_gte?: InputMaybe<Scalars['Bytes']['input']>;
  bidderCommitment_lte?: InputMaybe<Scalars['Bytes']['input']>;
  bidderCommitment_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  bidderCommitment_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  bidderCommitment_contains?: InputMaybe<Scalars['Bytes']['input']>;
  bidderCommitment_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  encryptedBidMetadataCID?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_not?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_gt?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_lt?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_gte?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_lte?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_in?: InputMaybe<Array<Scalars['String']['input']>>;
  encryptedBidMetadataCID_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  encryptedBidMetadataCID_contains?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_not_contains?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_starts_with?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_ends_with?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  encryptedBidMetadataCID_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  isAccepted?: InputMaybe<Scalars['Boolean']['input']>;
  isAccepted_not?: InputMaybe<Scalars['Boolean']['input']>;
  isAccepted_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isAccepted_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  userIdentifier?: InputMaybe<Scalars['Bytes']['input']>;
  userIdentifier_not?: InputMaybe<Scalars['Bytes']['input']>;
  userIdentifier_gt?: InputMaybe<Scalars['Bytes']['input']>;
  userIdentifier_lt?: InputMaybe<Scalars['Bytes']['input']>;
  userIdentifier_gte?: InputMaybe<Scalars['Bytes']['input']>;
  userIdentifier_lte?: InputMaybe<Scalars['Bytes']['input']>;
  userIdentifier_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  userIdentifier_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  userIdentifier_contains?: InputMaybe<Scalars['Bytes']['input']>;
  userIdentifier_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  encryptedKey?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_not?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_gt?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_lt?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_gte?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_lte?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_in?: InputMaybe<Array<Scalars['String']['input']>>;
  encryptedKey_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  encryptedKey_contains?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_not_contains?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_starts_with?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_ends_with?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  encryptedKey_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Bid_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Bid_filter>>>;
};

export type Bid_orderBy =
  | 'id'
  | 'request'
  | 'request__id'
  | 'request__commitment'
  | 'request__encryptedCID'
  | 'request__timestamp'
  | 'request__isActive'
  | 'request__bidCount'
  | 'request__userIdentifier'
  | 'request__title'
  | 'bidIndex'
  | 'bidderCommitment'
  | 'encryptedBidMetadataCID'
  | 'timestamp'
  | 'isAccepted'
  | 'userIdentifier'
  | 'encryptedKey';

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input'];
};

export type Block_height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
};

export type Greeting = {
  id: Scalars['ID']['output'];
  sender: Sender;
  greeting: Scalars['String']['output'];
  premium?: Maybe<Scalars['Boolean']['output']>;
  value?: Maybe<Scalars['BigInt']['output']>;
  createdAt: Scalars['BigInt']['output'];
  transactionHash: Scalars['String']['output'];
};

export type Greeting_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  sender?: InputMaybe<Scalars['String']['input']>;
  sender_not?: InputMaybe<Scalars['String']['input']>;
  sender_gt?: InputMaybe<Scalars['String']['input']>;
  sender_lt?: InputMaybe<Scalars['String']['input']>;
  sender_gte?: InputMaybe<Scalars['String']['input']>;
  sender_lte?: InputMaybe<Scalars['String']['input']>;
  sender_in?: InputMaybe<Array<Scalars['String']['input']>>;
  sender_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  sender_contains?: InputMaybe<Scalars['String']['input']>;
  sender_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  sender_not_contains?: InputMaybe<Scalars['String']['input']>;
  sender_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  sender_starts_with?: InputMaybe<Scalars['String']['input']>;
  sender_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sender_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  sender_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sender_ends_with?: InputMaybe<Scalars['String']['input']>;
  sender_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sender_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  sender_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sender_?: InputMaybe<Sender_filter>;
  greeting?: InputMaybe<Scalars['String']['input']>;
  greeting_not?: InputMaybe<Scalars['String']['input']>;
  greeting_gt?: InputMaybe<Scalars['String']['input']>;
  greeting_lt?: InputMaybe<Scalars['String']['input']>;
  greeting_gte?: InputMaybe<Scalars['String']['input']>;
  greeting_lte?: InputMaybe<Scalars['String']['input']>;
  greeting_in?: InputMaybe<Array<Scalars['String']['input']>>;
  greeting_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  greeting_contains?: InputMaybe<Scalars['String']['input']>;
  greeting_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  greeting_not_contains?: InputMaybe<Scalars['String']['input']>;
  greeting_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  greeting_starts_with?: InputMaybe<Scalars['String']['input']>;
  greeting_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  greeting_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  greeting_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  greeting_ends_with?: InputMaybe<Scalars['String']['input']>;
  greeting_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  greeting_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  greeting_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  premium?: InputMaybe<Scalars['Boolean']['input']>;
  premium_not?: InputMaybe<Scalars['Boolean']['input']>;
  premium_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  premium_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  value?: InputMaybe<Scalars['BigInt']['input']>;
  value_not?: InputMaybe<Scalars['BigInt']['input']>;
  value_gt?: InputMaybe<Scalars['BigInt']['input']>;
  value_lt?: InputMaybe<Scalars['BigInt']['input']>;
  value_gte?: InputMaybe<Scalars['BigInt']['input']>;
  value_lte?: InputMaybe<Scalars['BigInt']['input']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  transactionHash?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not?: InputMaybe<Scalars['String']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['String']['input']>;
  transactionHash_lt?: InputMaybe<Scalars['String']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['String']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['String']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['String']['input']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  transactionHash_contains?: InputMaybe<Scalars['String']['input']>;
  transactionHash_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Greeting_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Greeting_filter>>>;
};

export type Greeting_orderBy =
  | 'id'
  | 'sender'
  | 'sender__id'
  | 'sender__address'
  | 'sender__createdAt'
  | 'sender__greetingCount'
  | 'greeting'
  | 'premium'
  | 'value'
  | 'createdAt'
  | 'transactionHash';

/** Defines the order direction, either ascending or descending */
export type OrderDirection =
  | 'asc'
  | 'desc';

export type Query = {
  greeting?: Maybe<Greeting>;
  greetings: Array<Greeting>;
  sender?: Maybe<Sender>;
  senders: Array<Sender>;
  request?: Maybe<Request>;
  requests: Array<Request>;
  bid?: Maybe<Bid>;
  bids: Array<Bid>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type QuerygreetingArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerygreetingsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Greeting_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Greeting_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerysenderArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerysendersArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Sender_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Sender_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryrequestArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryrequestsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Request_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Request_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerybidArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerybidsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Bid_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Bid_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Query_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type Request = {
  id: Scalars['ID']['output'];
  commitment: Scalars['Bytes']['output'];
  encryptedCID: Scalars['String']['output'];
  timestamp: Scalars['BigInt']['output'];
  isActive: Scalars['Boolean']['output'];
  bidCount: Scalars['BigInt']['output'];
  userIdentifier: Scalars['Bytes']['output'];
  title: Scalars['String']['output'];
  bids: Array<Bid>;
};


export type RequestbidsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Bid_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Bid_filter>;
};

export type Request_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  commitment?: InputMaybe<Scalars['Bytes']['input']>;
  commitment_not?: InputMaybe<Scalars['Bytes']['input']>;
  commitment_gt?: InputMaybe<Scalars['Bytes']['input']>;
  commitment_lt?: InputMaybe<Scalars['Bytes']['input']>;
  commitment_gte?: InputMaybe<Scalars['Bytes']['input']>;
  commitment_lte?: InputMaybe<Scalars['Bytes']['input']>;
  commitment_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  commitment_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  commitment_contains?: InputMaybe<Scalars['Bytes']['input']>;
  commitment_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  encryptedCID?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_not?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_gt?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_lt?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_gte?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_lte?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_in?: InputMaybe<Array<Scalars['String']['input']>>;
  encryptedCID_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  encryptedCID_contains?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_not_contains?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_starts_with?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_ends_with?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  encryptedCID_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isActive_not?: InputMaybe<Scalars['Boolean']['input']>;
  isActive_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isActive_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  bidCount?: InputMaybe<Scalars['BigInt']['input']>;
  bidCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  bidCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  bidCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  bidCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  bidCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  bidCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  bidCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  userIdentifier?: InputMaybe<Scalars['Bytes']['input']>;
  userIdentifier_not?: InputMaybe<Scalars['Bytes']['input']>;
  userIdentifier_gt?: InputMaybe<Scalars['Bytes']['input']>;
  userIdentifier_lt?: InputMaybe<Scalars['Bytes']['input']>;
  userIdentifier_gte?: InputMaybe<Scalars['Bytes']['input']>;
  userIdentifier_lte?: InputMaybe<Scalars['Bytes']['input']>;
  userIdentifier_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  userIdentifier_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  userIdentifier_contains?: InputMaybe<Scalars['Bytes']['input']>;
  userIdentifier_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_not?: InputMaybe<Scalars['String']['input']>;
  title_gt?: InputMaybe<Scalars['String']['input']>;
  title_lt?: InputMaybe<Scalars['String']['input']>;
  title_gte?: InputMaybe<Scalars['String']['input']>;
  title_lte?: InputMaybe<Scalars['String']['input']>;
  title_in?: InputMaybe<Array<Scalars['String']['input']>>;
  title_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  title_contains?: InputMaybe<Scalars['String']['input']>;
  title_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  title_not_contains?: InputMaybe<Scalars['String']['input']>;
  title_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  title_starts_with?: InputMaybe<Scalars['String']['input']>;
  title_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  title_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  title_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  title_ends_with?: InputMaybe<Scalars['String']['input']>;
  title_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  title_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  title_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  bids_?: InputMaybe<Bid_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Request_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Request_filter>>>;
};

export type Request_orderBy =
  | 'id'
  | 'commitment'
  | 'encryptedCID'
  | 'timestamp'
  | 'isActive'
  | 'bidCount'
  | 'userIdentifier'
  | 'title'
  | 'bids';

export type Sender = {
  id: Scalars['ID']['output'];
  address: Scalars['Bytes']['output'];
  greetings?: Maybe<Array<Greeting>>;
  createdAt: Scalars['BigInt']['output'];
  greetingCount: Scalars['BigInt']['output'];
};


export type SendergreetingsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Greeting_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Greeting_filter>;
};

export type Sender_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  address?: InputMaybe<Scalars['Bytes']['input']>;
  address_not?: InputMaybe<Scalars['Bytes']['input']>;
  address_gt?: InputMaybe<Scalars['Bytes']['input']>;
  address_lt?: InputMaybe<Scalars['Bytes']['input']>;
  address_gte?: InputMaybe<Scalars['Bytes']['input']>;
  address_lte?: InputMaybe<Scalars['Bytes']['input']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  address_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  greetings_?: InputMaybe<Greeting_filter>;
  createdAt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  greetingCount?: InputMaybe<Scalars['BigInt']['input']>;
  greetingCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  greetingCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  greetingCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  greetingCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  greetingCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  greetingCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  greetingCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Sender_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Sender_filter>>>;
};

export type Sender_orderBy =
  | 'id'
  | 'address'
  | 'greetings'
  | 'createdAt'
  | 'greetingCount';

export type Subscription = {
  greeting?: Maybe<Greeting>;
  greetings: Array<Greeting>;
  sender?: Maybe<Sender>;
  senders: Array<Sender>;
  request?: Maybe<Request>;
  requests: Array<Request>;
  bid?: Maybe<Bid>;
  bids: Array<Bid>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type SubscriptiongreetingArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiongreetingsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Greeting_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Greeting_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionsenderArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionsendersArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Sender_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Sender_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionrequestArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionrequestsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Request_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Request_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionbidArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionbidsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Bid_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Bid_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Subscription_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type _Block_ = {
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']['output']>;
  /** The block number */
  number: Scalars['Int']['output'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']['output']>;
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']['output']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String']['output'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']['output'];
};

export type _SubgraphErrorPolicy_ =
  /** Data will be returned even if the subgraph has indexing errors */
  | 'allow'
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  | 'deny';

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string | ((fieldNode: FieldNode) => SelectionSetNode);
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Aggregation_interval: Aggregation_interval;
  Bid: ResolverTypeWrapper<Bid>;
  Bid_filter: Bid_filter;
  Bid_orderBy: Bid_orderBy;
  BigDecimal: ResolverTypeWrapper<Scalars['BigDecimal']['output']>;
  BigInt: ResolverTypeWrapper<Scalars['BigInt']['output']>;
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_height;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Bytes: ResolverTypeWrapper<Scalars['Bytes']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Greeting: ResolverTypeWrapper<Greeting>;
  Greeting_filter: Greeting_filter;
  Greeting_orderBy: Greeting_orderBy;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Int8: ResolverTypeWrapper<Scalars['Int8']['output']>;
  OrderDirection: OrderDirection;
  Query: ResolverTypeWrapper<{}>;
  Request: ResolverTypeWrapper<Request>;
  Request_filter: Request_filter;
  Request_orderBy: Request_orderBy;
  Sender: ResolverTypeWrapper<Sender>;
  Sender_filter: Sender_filter;
  Sender_orderBy: Sender_orderBy;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  Timestamp: ResolverTypeWrapper<Scalars['Timestamp']['output']>;
  _Block_: ResolverTypeWrapper<_Block_>;
  _Meta_: ResolverTypeWrapper<_Meta_>;
  _SubgraphErrorPolicy_: _SubgraphErrorPolicy_;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Bid: Bid;
  Bid_filter: Bid_filter;
  BigDecimal: Scalars['BigDecimal']['output'];
  BigInt: Scalars['BigInt']['output'];
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_height;
  Boolean: Scalars['Boolean']['output'];
  Bytes: Scalars['Bytes']['output'];
  Float: Scalars['Float']['output'];
  Greeting: Greeting;
  Greeting_filter: Greeting_filter;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Int8: Scalars['Int8']['output'];
  Query: {};
  Request: Request;
  Request_filter: Request_filter;
  Sender: Sender;
  Sender_filter: Sender_filter;
  String: Scalars['String']['output'];
  Subscription: {};
  Timestamp: Scalars['Timestamp']['output'];
  _Block_: _Block_;
  _Meta_: _Meta_;
}>;

export type entityDirectiveArgs = { };

export type entityDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = entityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type subgraphIdDirectiveArgs = {
  id: Scalars['String']['input'];
};

export type subgraphIdDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = subgraphIdDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type derivedFromDirectiveArgs = {
  field: Scalars['String']['input'];
};

export type derivedFromDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = derivedFromDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type BidResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Bid'] = ResolversParentTypes['Bid']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  request?: Resolver<ResolversTypes['Request'], ParentType, ContextType>;
  bidIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  bidderCommitment?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  encryptedBidMetadataCID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  isAccepted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  userIdentifier?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  encryptedKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface BigDecimalScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigDecimal'], any> {
  name: 'BigDecimal';
}

export interface BigIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigInt'], any> {
  name: 'BigInt';
}

export interface BytesScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Bytes'], any> {
  name: 'Bytes';
}

export type GreetingResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Greeting'] = ResolversParentTypes['Greeting']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['Sender'], ParentType, ContextType>;
  greeting?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  premium?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface Int8ScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Int8'], any> {
  name: 'Int8';
}

export type QueryResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  greeting?: Resolver<Maybe<ResolversTypes['Greeting']>, ParentType, ContextType, RequireFields<QuerygreetingArgs, 'id' | 'subgraphError'>>;
  greetings?: Resolver<Array<ResolversTypes['Greeting']>, ParentType, ContextType, RequireFields<QuerygreetingsArgs, 'skip' | 'first' | 'subgraphError'>>;
  sender?: Resolver<Maybe<ResolversTypes['Sender']>, ParentType, ContextType, RequireFields<QuerysenderArgs, 'id' | 'subgraphError'>>;
  senders?: Resolver<Array<ResolversTypes['Sender']>, ParentType, ContextType, RequireFields<QuerysendersArgs, 'skip' | 'first' | 'subgraphError'>>;
  request?: Resolver<Maybe<ResolversTypes['Request']>, ParentType, ContextType, RequireFields<QueryrequestArgs, 'id' | 'subgraphError'>>;
  requests?: Resolver<Array<ResolversTypes['Request']>, ParentType, ContextType, RequireFields<QueryrequestsArgs, 'skip' | 'first' | 'subgraphError'>>;
  bid?: Resolver<Maybe<ResolversTypes['Bid']>, ParentType, ContextType, RequireFields<QuerybidArgs, 'id' | 'subgraphError'>>;
  bids?: Resolver<Array<ResolversTypes['Bid']>, ParentType, ContextType, RequireFields<QuerybidsArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: Resolver<Maybe<ResolversTypes['_Meta_']>, ParentType, ContextType, Partial<Query_metaArgs>>;
}>;

export type RequestResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Request'] = ResolversParentTypes['Request']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  commitment?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  encryptedCID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  bidCount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  userIdentifier?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  bids?: Resolver<Array<ResolversTypes['Bid']>, ParentType, ContextType, RequireFields<RequestbidsArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SenderResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Sender'] = ResolversParentTypes['Sender']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  address?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  greetings?: Resolver<Maybe<Array<ResolversTypes['Greeting']>>, ParentType, ContextType, RequireFields<SendergreetingsArgs, 'skip' | 'first'>>;
  createdAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  greetingCount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  greeting?: SubscriptionResolver<Maybe<ResolversTypes['Greeting']>, "greeting", ParentType, ContextType, RequireFields<SubscriptiongreetingArgs, 'id' | 'subgraphError'>>;
  greetings?: SubscriptionResolver<Array<ResolversTypes['Greeting']>, "greetings", ParentType, ContextType, RequireFields<SubscriptiongreetingsArgs, 'skip' | 'first' | 'subgraphError'>>;
  sender?: SubscriptionResolver<Maybe<ResolversTypes['Sender']>, "sender", ParentType, ContextType, RequireFields<SubscriptionsenderArgs, 'id' | 'subgraphError'>>;
  senders?: SubscriptionResolver<Array<ResolversTypes['Sender']>, "senders", ParentType, ContextType, RequireFields<SubscriptionsendersArgs, 'skip' | 'first' | 'subgraphError'>>;
  request?: SubscriptionResolver<Maybe<ResolversTypes['Request']>, "request", ParentType, ContextType, RequireFields<SubscriptionrequestArgs, 'id' | 'subgraphError'>>;
  requests?: SubscriptionResolver<Array<ResolversTypes['Request']>, "requests", ParentType, ContextType, RequireFields<SubscriptionrequestsArgs, 'skip' | 'first' | 'subgraphError'>>;
  bid?: SubscriptionResolver<Maybe<ResolversTypes['Bid']>, "bid", ParentType, ContextType, RequireFields<SubscriptionbidArgs, 'id' | 'subgraphError'>>;
  bids?: SubscriptionResolver<Array<ResolversTypes['Bid']>, "bids", ParentType, ContextType, RequireFields<SubscriptionbidsArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: SubscriptionResolver<Maybe<ResolversTypes['_Meta_']>, "_meta", ParentType, ContextType, Partial<Subscription_metaArgs>>;
}>;

export interface TimestampScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Timestamp'], any> {
  name: 'Timestamp';
}

export type _Block_Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['_Block_'] = ResolversParentTypes['_Block_']> = ResolversObject<{
  hash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  parentHash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Meta_Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['_Meta_'] = ResolversParentTypes['_Meta_']> = ResolversObject<{
  block?: Resolver<ResolversTypes['_Block_'], ParentType, ContextType>;
  deployment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasIndexingErrors?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = MeshContext> = ResolversObject<{
  Bid?: BidResolvers<ContextType>;
  BigDecimal?: GraphQLScalarType;
  BigInt?: GraphQLScalarType;
  Bytes?: GraphQLScalarType;
  Greeting?: GreetingResolvers<ContextType>;
  Int8?: GraphQLScalarType;
  Query?: QueryResolvers<ContextType>;
  Request?: RequestResolvers<ContextType>;
  Sender?: SenderResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  Timestamp?: GraphQLScalarType;
  _Block_?: _Block_Resolvers<ContextType>;
  _Meta_?: _Meta_Resolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = MeshContext> = ResolversObject<{
  entity?: entityDirectiveResolver<any, any, ContextType>;
  subgraphId?: subgraphIdDirectiveResolver<any, any, ContextType>;
  derivedFrom?: derivedFromDirectiveResolver<any, any, ContextType>;
}>;

export type MeshContext = YourContractTypes.Context & BaseMeshContext;


import { fileURLToPath } from '@graphql-mesh/utils';
const baseDir = pathModule.join(pathModule.dirname(fileURLToPath(import.meta.url)), '..');

const importFn: ImportFn = <T>(moduleId: string) => {
  const relativeModuleId = (pathModule.isAbsolute(moduleId) ? pathModule.relative(baseDir, moduleId) : moduleId).split('\\').join('/').replace(baseDir + '/', '');
  switch(relativeModuleId) {
    case ".graphclient/sources/YourContract/introspectionSchema":
      return Promise.resolve(importedModule$0) as T;
    
    default:
      return Promise.reject(new Error(`Cannot find module '${relativeModuleId}'.`));
  }
};

const rootStore = new MeshStore('.graphclient', new FsStoreStorageAdapter({
  cwd: baseDir,
  importFn,
  fileType: "ts",
}), {
  readonly: true,
  validate: false
});

export const rawServeConfig: YamlConfig.Config['serve'] = undefined as any
export async function getMeshOptions(): Promise<GetMeshOptions> {
const pubsub = new PubSub();
const sourcesStore = rootStore.child('sources');
const logger = new DefaultLogger("GraphClient");
const cache = new (MeshCache as any)({
      ...({} as any),
      importFn,
      store: rootStore.child('cache'),
      pubsub,
      logger,
    } as any)

const sources: MeshResolvedSource[] = [];
const transforms: MeshTransform[] = [];
const additionalEnvelopPlugins: MeshPlugin<any>[] = [];
const yourContractTransforms = [];
const additionalTypeDefs = [] as any[];
const yourContractHandler = new GraphqlHandler({
              name: "YourContract",
              config: {"endpoint":"http://localhost:8000/subgraphs/name/scaffold-eth/your-contract"},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("YourContract"),
              logger: logger.child("YourContract"),
              importFn,
            });
sources[0] = {
          name: 'YourContract',
          handler: yourContractHandler,
          transforms: yourContractTransforms
        }
const additionalResolvers = [] as any[]
const merger = new(BareMerger as any)({
        cache,
        pubsub,
        logger: logger.child('bareMerger'),
        store: rootStore.child('bareMerger')
      })
const documentHashMap = {
        "0f297a8d2a5ec4bc2a5724a8582baf2b6027a6394dc10901d073d4602d66e9d4": GetGreetingsDocument,
"1fa2b97910102809c3294fb296641b657c0b19a91a49c96e57affe62a7ed0b0d": GetRequestsDocument,
"051487c01a127ad49931b81b930b317f95a5e562c5df3868cf32ba9f561c4f21": GetAllRequestsDocument
      }
additionalEnvelopPlugins.push(usePersistedOperations({
        getPersistedOperation(key) {
          return documentHashMap[key];
        },
        ...{}
      }))

  return {
    sources,
    transforms,
    additionalTypeDefs,
    additionalResolvers,
    cache,
    pubsub,
    merger,
    logger,
    additionalEnvelopPlugins,
    get documents() {
      return [
      {
        document: GetGreetingsDocument,
        get rawSDL() {
          return printWithCache(GetGreetingsDocument);
        },
        location: 'GetGreetingsDocument.graphql',
        sha256Hash: '0f297a8d2a5ec4bc2a5724a8582baf2b6027a6394dc10901d073d4602d66e9d4'
      },{
        document: GetRequestsDocument,
        get rawSDL() {
          return printWithCache(GetRequestsDocument);
        },
        location: 'GetRequestsDocument.graphql',
        sha256Hash: '1fa2b97910102809c3294fb296641b657c0b19a91a49c96e57affe62a7ed0b0d'
      },{
        document: GetAllRequestsDocument,
        get rawSDL() {
          return printWithCache(GetAllRequestsDocument);
        },
        location: 'GetAllRequestsDocument.graphql',
        sha256Hash: '051487c01a127ad49931b81b930b317f95a5e562c5df3868cf32ba9f561c4f21'
      }
    ];
    },
    fetchFn,
  };
}

export function createBuiltMeshHTTPHandler<TServerContext = {}>(): MeshHTTPHandler<TServerContext> {
  return createMeshHTTPHandler<TServerContext>({
    baseDir,
    getBuiltMesh: getBuiltGraphClient,
    rawServeConfig: undefined,
  })
}


let meshInstance$: Promise<MeshInstance> | undefined;

export const pollingInterval = null;

export function getBuiltGraphClient(): Promise<MeshInstance> {
  if (meshInstance$ == null) {
    if (pollingInterval) {
      setInterval(() => {
        getMeshOptions()
        .then(meshOptions => getMesh(meshOptions))
        .then(newMesh =>
          meshInstance$.then(oldMesh => {
            oldMesh.destroy()
            meshInstance$ = Promise.resolve(newMesh)
          })
        ).catch(err => {
          console.error("Mesh polling failed so the existing version will be used:", err);
        });
      }, pollingInterval)
    }
    meshInstance$ = getMeshOptions().then(meshOptions => getMesh(meshOptions)).then(mesh => {
      const id = mesh.pubsub.subscribe('destroy', () => {
        meshInstance$ = undefined;
        mesh.pubsub.unsubscribe(id);
      });
      return mesh;
    });
  }
  return meshInstance$;
}

export const execute: ExecuteMeshFn = (...args) => getBuiltGraphClient().then(({ execute }) => execute(...args));

export const subscribe: SubscribeMeshFn = (...args) => getBuiltGraphClient().then(({ subscribe }) => subscribe(...args));
export function getBuiltGraphSDK<TGlobalContext = any, TOperationContext = any>(globalContext?: TGlobalContext) {
  const sdkRequester$ = getBuiltGraphClient().then(({ sdkRequesterFactory }) => sdkRequesterFactory(globalContext));
  return getSdk<TOperationContext, TGlobalContext>((...args) => sdkRequester$.then(sdkRequester => sdkRequester(...args)));
}
export type GetGreetingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetGreetingsQuery = { greetings: Array<(
    Pick<Greeting, 'id' | 'greeting' | 'premium' | 'value' | 'createdAt'>
    & { sender: Pick<Sender, 'address' | 'greetingCount'> }
  )> };

export type GetRequestsQueryVariables = Exact<{
  identifier: Scalars['Bytes']['input'];
}>;


export type GetRequestsQuery = { requests: Array<Pick<Request, 'bidCount' | 'commitment' | 'isActive' | 'id' | 'title' | 'timestamp' | 'userIdentifier'>> };

export type GetAllRequestsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllRequestsQuery = { requests: Array<Pick<Request, 'bidCount' | 'commitment' | 'isActive' | 'id' | 'title' | 'timestamp' | 'userIdentifier'>> };


export const GetGreetingsDocument = gql`
    query GetGreetings {
  greetings(first: 25, orderBy: createdAt, orderDirection: desc) {
    id
    greeting
    premium
    value
    createdAt
    sender {
      address
      greetingCount
    }
  }
}
    ` as unknown as DocumentNode<GetGreetingsQuery, GetGreetingsQueryVariables>;
export const GetRequestsDocument = gql`
    query GetRequests($identifier: Bytes!) {
  requests(
    where: {userIdentifier: $identifier}
    orderBy: timestamp
    orderDirection: desc
  ) {
    bidCount
    commitment
    isActive
    id
    title
    timestamp
    userIdentifier
  }
}
    ` as unknown as DocumentNode<GetRequestsQuery, GetRequestsQueryVariables>;
export const GetAllRequestsDocument = gql`
    query GetAllRequests {
  requests {
    bidCount
    commitment
    isActive
    id
    title
    timestamp
    userIdentifier
  }
}
    ` as unknown as DocumentNode<GetAllRequestsQuery, GetAllRequestsQueryVariables>;




export type Requester<C = {}, E = unknown> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>
export function getSdk<C, E>(requester: Requester<C, E>) {
  return {
    GetGreetings(variables?: GetGreetingsQueryVariables, options?: C): Promise<GetGreetingsQuery> {
      return requester<GetGreetingsQuery, GetGreetingsQueryVariables>(GetGreetingsDocument, variables, options) as Promise<GetGreetingsQuery>;
    },
    GetRequests(variables: GetRequestsQueryVariables, options?: C): Promise<GetRequestsQuery> {
      return requester<GetRequestsQuery, GetRequestsQueryVariables>(GetRequestsDocument, variables, options) as Promise<GetRequestsQuery>;
    },
    GetAllRequests(variables?: GetAllRequestsQueryVariables, options?: C): Promise<GetAllRequestsQuery> {
      return requester<GetAllRequestsQuery, GetAllRequestsQueryVariables>(GetAllRequestsDocument, variables, options) as Promise<GetAllRequestsQuery>;
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;