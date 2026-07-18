// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from "@storybook/react";
import { GlossyRewardButton } from "./GlossyRewardButton";

const meta: Meta<typeof GlossyRewardButton> = {
  title: "Admin/GlossyRewardButton",
  component: GlossyRewardButton,
};
export default meta;

type Story = StoryObj<typeof GlossyRewardButton>;

// Mirrors BankComparisonCard.tsx's exact usage: width-only className, no
// height utility -- the component derives height from the image's real
// aspect ratio itself. Forcing a fixed height here (h-12 etc.) is exactly
// what broke this twice (cropped it, then shrank it).
export const MobileWidth: Story = {
  render: () => (
    <div style={{ width: 320, padding: 16, background: "#f8fafc" }}>
      <GlossyRewardButton colorScheme="ocean-blue" className="w-full" />
    </div>
  ),
};

export const DesktopWidth: Story = {
  render: () => (
    <div style={{ width: 175, padding: 16, background: "#f8fafc" }}>
      <GlossyRewardButton colorScheme="ocean-blue" className="w-full" />
    </div>
  ),
};

export const AllColorSchemes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 320, padding: 16, background: "#f8fafc" }}>
      {["ocean-blue", "sunset-gradient", "deep-navy", "teal-gradient", "emerald-glow", "neon-cyber", "midnight-purple", "minimal-mono", "golden-prestige", "crimson-red"].map((scheme) => (
        <GlossyRewardButton key={scheme} colorScheme={scheme} className="w-full" />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 320, padding: 16, background: "#f8fafc" }}>
      <GlossyRewardButton colorScheme="ocean-blue" disabled className="w-full" />
    </div>
  ),
};
