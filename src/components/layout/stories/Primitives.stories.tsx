import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PageShell, Surface, Stack, Inline, ContentContainer, SplitLayout, MediaPanel } from '../index';

const meta: Meta = {
  title: 'Foundation/Layout Primitives',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const PageShellStory: StoryObj = {
  name: 'PageShell',
  render: () => (
    <div className="bg-slate-100 min-h-screen">
      <PageShell className="bg-white border-x border-dashed border-slate-300 min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-mono">PageShell Content Area</p>
      </PageShell>
    </div>
  ),
};

export const SurfaceStory: StoryObj = {
  name: 'Surface',
  render: () => (
    <div className="p-8 bg-slate-50 min-h-screen flex items-center justify-center">
      <Surface className="p-[var(--space-8)] max-w-sm">
        <h3 className="font-bold mb-2">Surface Element</h3>
        <p className="text-slate-500 text-sm">Elevated container with radius, shadow, and background defined by tokens.</p>
      </Surface>
    </div>
  ),
};

export const StackStory: StoryObj = {
  name: 'Stack',
  render: () => (
    <div className="p-8 bg-slate-50 min-h-screen flex items-center justify-center">
      <Surface className="p-[var(--space-6)] min-w-[300px]">
        <Stack gap="var(--space-4)">
          <div className="bg-blue-100 p-4 rounded text-blue-800 text-center">Stack Item 1</div>
          <div className="bg-blue-100 p-4 rounded text-blue-800 text-center">Stack Item 2</div>
          <div className="bg-blue-100 p-4 rounded text-blue-800 text-center">Stack Item 3</div>
        </Stack>
      </Surface>
    </div>
  ),
};

export const InlineStory: StoryObj = {
  name: 'Inline',
  render: () => (
    <div className="p-8 bg-slate-50 min-h-screen flex items-center justify-center">
      <Surface className="p-[var(--space-6)] min-w-[400px]">
        <Inline gap="var(--space-4)" justify="space-between" align="center">
          <div className="bg-emerald-100 p-4 rounded text-emerald-800">Left Item</div>
          <div className="bg-emerald-100 p-4 rounded text-emerald-800">Right Item</div>
        </Inline>
      </Surface>
    </div>
  ),
};

export const ContentContainerStory: StoryObj = {
  name: 'ContentContainer',
  render: () => (
    <div className="p-8 bg-slate-100 min-h-screen">
      <ContentContainer width="readable" className="bg-white border border-dashed border-slate-300 p-8 text-center text-slate-500 font-mono">
        ContentContainer (readable width)
      </ContentContainer>
    </div>
  ),
};

export const SplitLayoutStory: StoryObj = {
  name: 'SplitLayout',
  render: () => (
    <div className="p-8 bg-slate-100 min-h-screen">
      <SplitLayout className="grid-cols-1 md:grid-cols-2 gap-[var(--space-8)]">
        <SplitLayout.Media className="bg-indigo-100 p-8 rounded-xl flex items-center justify-center min-h-[300px]">
          <span className="text-indigo-800 font-bold">Media Slot</span>
        </SplitLayout.Media>
        <SplitLayout.Content className="bg-white p-8 rounded-xl flex items-center justify-center min-h-[300px] border border-slate-200 shadow-sm">
          <span className="text-slate-800 font-bold">Content Slot</span>
        </SplitLayout.Content>
      </SplitLayout>
    </div>
  ),
};

export const MediaPanelStory: StoryObj = {
  name: 'MediaPanel',
  render: () => (
    <div className="p-8 bg-slate-100 min-h-screen flex items-center justify-center">
      <MediaPanel className="w-full max-w-lg aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
        Arbitrary Media Slot
      </MediaPanel>
    </div>
  ),
};
