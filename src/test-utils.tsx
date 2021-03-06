import * as React from 'react';
import ApolloClient from 'apollo-client';
import { DefaultOptions, Resolvers } from 'apollo-client';
import { InMemoryCache as Cache } from 'apollo-cache-inmemory';

import { ApolloProvider } from './react-apollo.cjs';
import { MockedResponse, MockLink } from './test-links';
import { ApolloCache } from 'apollo-cache';
export * from './test-links';

export interface MockedProviderProps<TSerializedCache = {}> {
  mocks?: ReadonlyArray<MockedResponse>;
  addTypename?: boolean;
  defaultOptions?: DefaultOptions;
  cache?: ApolloCache<TSerializedCache>;
  resolvers?: Resolvers;
  childProps?: object;
  children?: React.ReactElement;
}

export interface MockedProviderState {
  client: ApolloClient<any>;
}

export class MockedProvider extends React.Component<MockedProviderProps, MockedProviderState> {
  public static defaultProps: MockedProviderProps = {
    addTypename: true,
  };

  constructor(props: MockedProviderProps) {
    super(props);

    const {
      mocks,
      addTypename,
      defaultOptions,
      cache,
      resolvers,
    } = this.props;
    const client = new ApolloClient({
      cache: cache || new Cache({ addTypename }),
      defaultOptions,
      link: new MockLink(mocks || [], addTypename),
      resolvers,
    });

    this.state = { client };
  }

  public render() {
    const { children, childProps } = this.props;
    return children
      ? (
        <ApolloProvider client={this.state.client}>
          {React.cloneElement(React.Children.only(children), { ...childProps })}
        </ApolloProvider>
      )
      : null;
  }

  public componentWillUnmount() {
    // Since this.state.client was created in the constructor, it's this
    // MockedProvider's responsibility to terminate it.
    this.state.client.stop();
  }
}
