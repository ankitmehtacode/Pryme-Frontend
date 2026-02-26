import { Gift, Percent, Tag, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Offer {
  id: string;
  type: "discount" | "cashback" | "reward" | "gift";
  title: string;
  description: string;
  bank?: string;
  validTill?: string;
}

const defaultOffers: Offer[] = [
  {
    id: "1",
    type: "discount",
    title: "50% Off Processing Fee",
    description: "Apply through PYRME and get 50% off on processing charges",
    bank: "HDFC Bank",
    validTill: "31 Dec 2024"
  },
  {
    id: "2",
    type: "cashback",
    title: "₹2,000 Cashback",
    description: "Get ₹2,000 cashback on first EMI payment",
    bank: "ICICI Bank",
    validTill: "15 Jan 2025"
  },
  {
    id: "3",
    type: "gift",
    title: "Amazon Gift Card",
    description: "Get ₹500 Amazon gift card on loan disbursement",
    bank: "Axis Bank",
    validTill: "31 Dec 2024"
  },
  {
    id: "4",
    type: "reward",
    title: "Loyalty Points",
    description: "Earn 5000 reward points on successful loan approval",
    bank: "SBI",
    validTill: "Ongoing"
  }
];

const OffersRewards = ({ offers = defaultOffers }: { offers?: Offer[] }) => {
  const getOfferIcon = (type: Offer["type"]) => {
    switch (type) {
      case "discount": return Percent;
      case "cashback": return Tag;
      case "gift": return Gift;
      case "reward": return Sparkles;
    }
  };

  const getOfferColor = (type: Offer["type"]) => {
    switch (type) {
      case "discount": return "text-success bg-success/10";
      case "cashback": return "text-primary bg-primary/10";
      case "gift": return "text-accent bg-accent/10";
      case "reward": return "text-trust bg-trust/10";
    }
  };

  return (
    <div className="neo-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl neo-card-inset flex items-center justify-center">
          <Gift className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Offers & Rewards</h3>
          <p className="text-xs text-muted-foreground">Exclusive deals for you</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {offers.map((offer) => {
          const Icon = getOfferIcon(offer.type);
          return (
            <div 
              key={offer.id} 
              className="p-4 neo-card-inset rounded-xl hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", getOfferColor(offer.type))}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{offer.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{offer.description}</p>
                  {offer.bank && (
                    <p className="text-xs text-primary mt-2">{offer.bank}</p>
                  )}
                  {offer.validTill && (
                    <p className="text-xs text-muted-foreground">Valid till: {offer.validTill}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OffersRewards;
