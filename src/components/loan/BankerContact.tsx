import { Phone, Mail, Clock, Building2, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BankerInfo {
  name: string;
  designation: string;
  bank: string;
  phone: string;
  email: string;
  availability: string;
  photo?: string;
}

interface BankerContactProps {
  banker?: BankerInfo;
}

const defaultBanker: BankerInfo = {
  name: "Aadesh Kothari",
  designation: "Relationship Manager",
  bank: "PYRME Consulting",
  phone: "+91 98765 43210",
  email: "aadesh@pyrme.com",
  availability: "Mon-Sat, 9 AM - 6 PM",
};

const BankerContact = ({ banker = defaultBanker }: BankerContactProps) => {
  return (
    <div className="neo-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl neo-card-inset flex items-center justify-center">
          <Phone className="w-5 h-5 text-success" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Your RM Contact</h3>
          <p className="text-xs text-muted-foreground">Get personalized assistance</p>
        </div>
      </div>

      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-20 h-20 rounded-full neo-card-inset flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h4 className="font-semibold text-lg text-foreground">{banker.name}</h4>
        <p className="text-sm text-muted-foreground">{banker.designation}</p>
        <div className="flex items-center gap-1 text-xs text-primary mt-1">
          <Building2 className="w-3 h-3" />
          <span>{banker.bank}</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 p-3 neo-card-inset rounded-lg">
          <Phone className="w-4 h-4 text-success" />
          <span className="text-sm text-foreground">{banker.phone}</span>
        </div>
        <div className="flex items-center gap-3 p-3 neo-card-inset rounded-lg">
          <Mail className="w-4 h-4 text-primary" />
          <span className="text-sm text-foreground">{banker.email}</span>
        </div>
        <div className="flex items-center gap-3 p-3 neo-card-inset rounded-lg">
          <Clock className="w-4 h-4 text-trust" />
          <span className="text-sm text-muted-foreground">{banker.availability}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button className="neo-button border-0 bg-success hover:bg-success/90 text-success-foreground">
          <Phone className="w-4 h-4 mr-2" />
          Call Now
        </Button>
        <Button variant="outline" className="neo-button border-0">
          <MessageSquare className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default BankerContact;
