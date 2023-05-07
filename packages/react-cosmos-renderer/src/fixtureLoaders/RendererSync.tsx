'use client';
import React from 'react';
import { FixtureList } from 'react-cosmos-core';
import { RendererContext } from '../rendererConnect/RendererContext.js';

type Props = {
  children: React.ReactNode;
  fixtures: FixtureList;
};
export function RendererSync({ children, fixtures }: Props) {
  const { searchParams, rendererId, rendererConnect, reloadRenderer } =
    React.useContext(RendererContext);

  const { fixtureId: selectedFixtureId } = searchParams;

  const readyRef = React.useRef(false);
  React.useEffect(() => {
    if (!readyRef.current) {
      rendererConnect.postMessage({
        type: 'rendererReady',
        payload: {
          rendererId,
          selectedFixtureId,
        },
      });
      readyRef.current = true;
    }
  }, [rendererConnect, rendererId, selectedFixtureId]);

  React.useEffect(() => {
    rendererConnect.postMessage({
      type: 'fixtureListUpdate',
      payload: {
        rendererId,
        fixtures,
      },
    });
  }, [fixtures, rendererConnect, rendererId]);

  React.useEffect(
    () =>
      rendererConnect.onMessage(msg => {
        if (msg.type === 'pingRenderers') {
          rendererConnect.postMessage({
            type: 'rendererReady',
            payload: {
              rendererId,
              selectedFixtureId,
            },
          });
          rendererConnect.postMessage({
            type: 'fixtureListUpdate',
            payload: {
              rendererId,
              fixtures,
            },
          });
        } else if (
          msg.type === 'reloadRenderer' &&
          msg.payload.rendererId === rendererId
        ) {
          reloadRenderer();
        }
      }),
    [fixtures, reloadRenderer, rendererConnect, rendererId, selectedFixtureId]
  );

  return <>{children}</>;
}
