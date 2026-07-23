// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from "@storybook/react";
import { GlossyRewardButton } from "./GlossyRewardButton";

const meta: Meta<typeof GlossyRewardButton> = {
  title: "Admin/GlossyRewardButton",
  component: GlossyRewardButton,
};
export default meta;

type Story = StoryObj<typeof GlossyRewardButton>;

// Mirrors BankComparisonCard.tsx's exact usage: width-only className, height
// comes from the component's own h-12/md:h-[52px] classes.
export const MobileWidth: Story = {
  render: () => (
    <div style={{ width: 320, padding: 16, background: "#f8fafc" }}>
      <GlossyRewardButton className="w-full" />
    </div>
  ),
};

export const DesktopWidth: Story = {
  render: () => (
    <div style={{ width: 175, padding: 16, background: "#f8fafc" }}>
      <GlossyRewardButton className="w-full" />
    </div>
  ),
};

export const NoRewardsRibbon: Story = {
  render: () => (
    <div style={{ width: 320, padding: 16, background: "#f8fafc" }}>
      <GlossyRewardButton showRewardsRibbon={false} className="w-full" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 320, padding: 16, background: "#f8fafc" }}>
      <GlossyRewardButton disabled className="w-full" />
    </div>
  ),
};
