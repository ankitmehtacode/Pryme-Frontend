import type { Meta, StoryObj } from "@storybook/react";
import { GlossyRewardButton } from "./GlossyRewardButton";

const meta: Meta<typeof GlossyRewardButton> = {
  title: "Admin/GlossyRewardButton",
  component: GlossyRewardButton,
};
export default meta;

type Story = StoryObj<typeof GlossyRewardButton>;

// Mirrors BankComparisonCard.tsx's exact usage: w-full on mobile, fixed
// width on desktop, h-12/h-11 -- the container shape that broke the old
// image-based button.
export const MobileWidth: Story = {
  render: () => (
    <div style={{ width: 320, padding: 16, background: "#f8fafc" }}>
      <GlossyRewardButton colorScheme="ocean-blue" className="w-full h-12 flex justify-center items-center" />
    </div>
  ),
};

export const DesktopWidth: Story = {
  render: () => (
    <div style={{ width: 175, padding: 16, background: "#f8fafc" }}>
      <GlossyRewardButton colorScheme="ocean-blue" className="w-full h-11 flex justify-center items-center" />
    </div>
  ),
};

export const AllColorSchemes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 320, padding: 16, background: "#f8fafc" }}>
      {["ocean-blue", "sunset-gradient", "deep-navy", "teal-gradient", "emerald-glow", "neon-cyber", "midnight-purple", "minimal-mono", "golden-prestige", "crimson-red"].map((scheme) => (
        <GlossyRewardButton key={scheme} colorScheme={scheme} className="w-full h-12 flex justify-center items-center" />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 320, padding: 16, background: "#f8fafc" }}>
      <GlossyRewardButton colorScheme="ocean-blue" disabled className="w-full h-12 flex justify-center items-center" />
    </div>
  ),
};
