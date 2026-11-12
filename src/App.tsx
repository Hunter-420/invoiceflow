import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { InvoicesListView } from './views/InvoicesListView';
import { InvoiceEditorView } from './views/InvoiceEditorView';
import { InvoiceDetailView } from './views/InvoiceDetailView';
import { PublicPayView } from './views/PublicPayView';
import { ClientsView } from './views/ClientsView';
import { BillingView } from './views/BillingView';
import { PricingView } from './views/PricingView';
import { AdminAccountsView } from './views/AdminAccountsView';
import { SettingsView } from './views/SettingsView';
import { LoginView } from './views/LoginView';
import { NotFoundView } from './views/NotFoundView';
import { InvoiceFlowStore } from './lib/store';
import { Profile, Subscription, Invoice } from './lib/types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [profile, setProfile] = useState<Profile>(() => InvoiceFlowStore.getProfile());
  const [subscription, setSubscription] = useState<Subscription>(() => InvoiceFlowStore.getSubscription());
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const syncHash = () => {
      const rawHash = window.location.hash.replace('#', '').trim();
      const tab = rawHash.split('?')[0];
      if (!tab) {
        setCurrentTab('landing');
      } else {
        setCurrentTab(tab);
      }
    };

    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  const handleNavigate = (tab: string) => {
    window.location.hash = tab;
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleSwitch = (role: 'pro' | 'admin' | 'free') => {
    InvoiceFlowStore.setActiveRole(role);
    setProfile(InvoiceFlowStore.getProfile());
    setSubscription(InvoiceFlowStore.getSubscription());
  };

  const handleSelectInvoice = (inv: Invoice) => {
    setSelectedInvoice(inv);
    handleNavigate('invoice-detail');
  };

  const renderView = () => {
    // Dynamic path handling for invoice payment links: #pay/<id>
    if (currentTab.startsWith('pay/')) {
      const invId = currentTab.replace('pay/', '');
      const inv =
        InvoiceFlowStore.getInvoices().find((i) => i.id === invId) ||
        selectedInvoice ||
        InvoiceFlowStore.getInvoices()[0];
      return <PublicPayView invoice={inv} onBack={() => handleNavigate('invoices')} />;
    }

    switch (currentTab) {
      case 'landing':
        return <LandingView onNavigate={handleNavigate} />;
      case 'dashboard':
        return <DashboardView onNavigate={handleNavigate} onSelectInvoice={handleSelectInvoice} />;
      case 'invoices':
        return <InvoicesListView onNavigate={handleNavigate} onSelectInvoice={handleSelectInvoice} />;
      case 'invoice-new':
        return (
          <InvoiceEditorView
            onNavigate={handleNavigate}
            onSaveSuccess={(inv) => {
              setSelectedInvoice(inv);
              handleNavigate('invoice-detail');
            }}
          />
        );
      case 'invoice-detail':
        return selectedInvoice ? (
          <InvoiceDetailView
            invoice={selectedInvoice}
            onBack={() => handleNavigate('invoices')}
            onOpenPublicPay={(inv) => {
              setSelectedInvoice(inv);
              handleNavigate('public-pay');
            }}
          />
        ) : (
          <InvoicesListView onNavigate={handleNavigate} onSelectInvoice={handleSelectInvoice} />
        );
      case 'public-pay':
        return selectedInvoice ? (
          <PublicPayView invoice={selectedInvoice} onBack={() => handleNavigate('invoice-detail')} />
        ) : (
          <InvoicesListView onNavigate={handleNavigate} onSelectInvoice={handleSelectInvoice} />
        );
      case 'clients':
        return <ClientsView onNavigate={handleNavigate} />;
      case 'billing':
        return (
          <BillingView
            onNavigate={handleNavigate}
            subscription={subscription}
            onSubscriptionUpdate={() => setSubscription(InvoiceFlowStore.getSubscription())}
          />
        );
      case 'pricing':
        return (
          <PricingView
            onNavigate={handleNavigate}
            subscription={subscription}
            onSubscriptionUpdate={() => setSubscription(InvoiceFlowStore.getSubscription())}
          />
        );
      case 'admin':
        return <AdminAccountsView onNavigate={handleNavigate} profile={profile} />;
      case 'settings':
        return (
          <SettingsView
            profile={profile}
            onProfileUpdate={() => setProfile(InvoiceFlowStore.getProfile())}
          />
        );
      case 'login':
        return <LoginView onNavigate={handleNavigate} onRoleSwitch={handleRoleSwitch} />;
      case 'signup':
        return (
          <LoginView
            initialSignUp={true}
            onNavigate={handleNavigate}
            onRoleSwitch={handleRoleSwitch}
          />
        );
      case 'forgot-password':
        return <LoginView onNavigate={handleNavigate} onRoleSwitch={handleRoleSwitch} />;
      default:
        return <NotFoundView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-[#4F46E5] selection:text-white">
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        profile={profile}
        subscription={subscription}
        onRoleSwitch={handleRoleSwitch}
      />
      <main className="flex-1">
        {renderView()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};
export default App;
