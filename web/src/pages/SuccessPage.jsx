import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SuccessPage = () => (
  <>
    <Helmet><title>Order Confirmed — Netiaxke</title></Helmet>
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <CheckCircle className="h-16 w-16 text-primary" />
      <h1 className="mt-6 font-display text-3xl font-700 text-foreground">Thank you for your order!</h1>
      <p className="mt-3 text-muted-foreground">
        Your payment was successful. Our team will be in touch shortly to arrange delivery
        or schedule your installation.
      </p>
      <Button asChild className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
        <Link to="/store">Continue shopping</Link>
      </Button>
    </div>
  </>
);

export default SuccessPage;
