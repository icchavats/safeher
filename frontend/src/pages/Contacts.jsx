import React, { useState, useEffect } from 'react';
import { contactService } from '../services/contactService';
import { ContactCard } from '../components/ContactCard';
import { ContactForm } from '../components/ContactForm';
import { UserPlus, Users, BellRing } from 'lucide-react';

export const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await contactService.getContacts();
      if (res.success) {
        setContacts(res.contacts);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSaveContact = async (formData) => {
    if (editingContact) {
      await contactService.updateContact(editingContact._id, formData);
      setNotification({ type: 'success', message: 'Contact updated successfully' });
    } else {
      await contactService.createContact(formData);
      setNotification({ type: 'success', message: 'Emergency contact added' });
    }
    setModalOpen(false);
    setEditingContact(null);
    fetchContacts();
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Are you sure you want to remove this emergency contact?')) {
      try {
        await contactService.deleteContact(id);
        setNotification({ type: 'success', message: 'Contact deleted' });
        fetchContacts();
      } catch (err) {
        setNotification({ type: 'error', message: 'Failed to delete contact' });
      }
    }
  };

  const handleTestAlert = async (id) => {
    try {
      const res = await contactService.testContact(id);
      setNotification({ type: 'success', message: res.message || 'Test SOS alert sent to contact!' });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to dispatch test notification',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-rose-500" />
            <span>Emergency Guardians & Contacts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            These trusted contacts are instantly alerted with live GPS tracking whenever SOS is triggered
          </p>
        </div>

        <button
          onClick={() => {
            setEditingContact(null);
            setModalOpen(true);
          }}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50 transition flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Emergency Contact</span>
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between ${
          notification.type === 'success'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* In-App Web SOS Info Card */}
      <div className="p-5 bg-gradient-to-r from-rose-950/40 via-slate-900 to-emerald-950/30 border border-rose-500/30 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30 flex-shrink-0">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Instant Web App SOS &amp; Loud Siren Delivery</span>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded-full font-mono">BUILT-IN</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Save trusted contacts using the phone number or email they registered with on SafeVoice. When you trigger SOS, their SafeVoice web app immediately sounds a loud emergency siren and displays your live GPS location, audio evidence, and details.
            </p>
          </div>
        </div>
      </div>

      {/* Contacts List Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          Loading trusted contacts...
        </div>
      ) : contacts.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-8">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No emergency contacts configured yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
            Add at least 2 trusted family members, friends, or local authorities so SafeVoice can broadcast your SOS alerts immediately.
          </p>
          <button
            onClick={() => {
              setEditingContact(null);
              setModalOpen(true);
            }}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition inline-flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Your First Contact</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {contacts.map((contact) => (
            <ContactCard
              key={contact._id}
              contact={contact}
              onEdit={(c) => {
                setEditingContact(c);
                setModalOpen(true);
              }}
              onDelete={handleDeleteContact}
              onTestAlert={handleTestAlert}
            />
          ))}
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <ContactForm
          initialData={editingContact}
          onSave={handleSaveContact}
          onCancel={() => {
            setModalOpen(false);
            setEditingContact(null);
          }}
        />
      )}

    </div>
  );
};
