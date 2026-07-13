'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import Link from 'next/link';
import {
  BarChart3,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {supabase} from '@/lib/supabase';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import RequestDetailsPanel from './RequestDetailsPanel';
import {ToastContainer, ToastProps, ToastType} from './Toast';

type QuickCheckAnswer = {
  label: string;
  value: string;
};

type RndEstimate = {
  id: string;
  model_version: string;
  stichtag: string;
  building_type_label: string;
  gnd_years: number | null;
  actual_age: number;
  preliminary_rnd: number | null;
  modernization_points_rounded: number;
  modified_rnd: number | null;
  calculation_method: string;
  result_status: 'calculated' | 'manual_review';
  warnings: {code: string; message: string}[];
};

type Request = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string | null;
  address: string;
  year: number | null;
  status: 'pending' | 'reviewing' | 'completed';
  documents: string[];
  source?: string | null;
  quick_check_answers?: QuickCheckAnswer[] | null;
  rnd_estimates?: RndEstimate | RndEstimate[] | null;
};

export default function AdminDashboard({session}: {session: any}) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);
  const toastCounterRef = useRef(0);

  const itemsPerPage = 10;

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    toastCounterRef.current += 1;
    const id = `toast-${toastCounterRef.current}`;
    setToasts((prev) => [...prev, {id, message, type}]);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const fetchRequests = useCallback(async () => {
    const {data, error} = await supabase
      .from('property_requests')
      .select('*, rnd_estimates(*)')
      .order('created_at', {ascending: false});

    if (error) {
      console.error('Error fetching requests:', error);
      addToast('Fehler beim Laden der Anfragen', 'error');
    } else {
      setRequests(data || []);
    }
  }, [addToast]);

  useEffect(() => {
    let isMounted = true;

    const initialFetch = async () => {
      setLoading(true);
      await fetchRequests();

      if (isMounted) {
        setLoading(false);
      }
    };

    initialFetch();

    return () => {
      isMounted = false;
    };
  }, [fetchRequests]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRequests();

    setTimeout(() => {
      setIsRefreshing(false);
      addToast('Daten erfolgreich aktualisiert', 'success');
    }, 350);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const updateRequestStatus = async (id: string, newStatus: string) => {
    const {error} = await supabase.from('property_requests').update({status: newStatus}).eq('id', id);

    if (!error) {
      setRequests((prev) => prev.map((req) => (req.id === id ? {...req, status: newStatus as Request['status']} : req)));
      if (selectedRequest?.id === id) {
        setSelectedRequest({...selectedRequest, status: newStatus as Request['status']});
      }
      addToast(`Status erfolgreich auf "${newStatus}" gesetzt`, 'success');
    } else {
      addToast('Fehler beim Aktualisieren des Status', 'error');
    }
  };

  const deleteRequest = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRequestToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!requestToDelete) {
      return;
    }

    setIsDeleting(true);

    const requestRecord = requests.find((request) => request.id === requestToDelete);
    if (requestRecord?.documents?.length) {
      const {error: documentError} = await supabase.storage.from('documents').remove(requestRecord.documents);
      if (documentError) {
        console.error('Error deleting request documents:', documentError);
        addToast('Dokumente konnten nicht gelöscht werden', 'error');
        setIsDeleting(false);
        return;
      }
    }

    const {error} = await supabase.from('property_requests').delete().eq('id', requestToDelete);

    if (!error) {
      setRequests((prev) => prev.filter((req) => req.id !== requestToDelete));
      if (selectedRequest?.id === requestToDelete) {
        setSelectedRequest(null);
      }
      addToast('Anfrage erfolgreich gelöscht', 'success');
    } else {
      console.error('Error deleting request:', error);
      addToast('Fehler beim Löschen der Anfrage', 'error');
    }

    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setRequestToDelete(null);
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));
  const visiblePage = Math.min(currentPage, totalPages);
  const startIndex = (visiblePage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    reviewing: requests.filter((r) => r.status === 'reviewing').length,
    completed: requests.filter((r) => r.status === 'completed').length,
  };

  const chartData = useMemo(() => {
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = requests.filter((r) => r.created_at.startsWith(dateStr)).length;

      data.push({
        name: d.toLocaleDateString('de-DE', {weekday: 'short'}),
        Anfragen: count,
      });
    }

    return data;
  }, [requests]);

  const exportToCSV = () => {
    const headers = ['Name', 'E-Mail', 'Telefon', 'Quelle', 'Adresse', 'Baujahr', 'Status', 'Datum', 'Dokumente'];
    const csvData = filteredRequests.map((req) => [
      req.name,
      req.email,
      req.phone || 'Nicht angegeben',
      getSourceLabel(req.source),
      req.address,
      req.year || 'Nicht angegeben',
      req.status,
      new Date(req.created_at).toLocaleDateString('de-DE'),
      req.documents?.length || 0,
    ]);

    const csvContent = [headers.join(','), ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `gutachten_anfragen_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('CSV-Export erfolgreich gestartet', 'success');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-ink)]">
      <div className="pointer-events-none absolute left-[-10rem] top-[-7rem] h-[26rem] w-[26rem] rounded-full bg-[var(--color-accent-soft)] blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-10rem] right-[-8rem] h-[24rem] w-[24rem] rounded-full bg-[var(--color-accent-soft)] blur-[130px]" />

      <div className="relative z-10 flex min-h-screen flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="admin-card flex w-full shrink-0 flex-col rounded-[2rem] p-4 lg:w-72 lg:p-5">
          <div className="flex items-center gap-3 rounded-[1.4rem] px-2 py-1">
            <div className="theme-contrast-panel flex h-11 w-11 items-center justify-center rounded-[1rem] shadow-[0_16px_28px_-18px_rgba(0,0,0,0.35)]">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="font-heading text-xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">Admin Portal</div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Restnutzungsdauer
              </div>
            </div>
          </div>

          <div className="admin-card-muted mt-5 rounded-[1.6rem] p-4">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
              Interner Bereich
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
              Anfragen, Dokumente und Status im Überblick.
            </p>
          </div>

          <nav className="mt-5 grid gap-2">
            <button className="admin-solid-btn flex items-center gap-3 rounded-[1.15rem] px-4 py-3 text-sm font-semibold">
              <LayoutDashboard size={18} />
              Übersicht
            </button>
            <Link
              href="/"
              target="_blank"
              className="admin-ghost-btn flex items-center gap-3 rounded-[1.15rem] px-4 py-3 text-sm font-semibold"
            >
              <ExternalLink size={18} />
              Zur Website
            </Link>
          </nav>

          <div className="mt-auto pt-6">
            <div className="admin-card-muted rounded-[1.5rem] p-4">
              <div className="flex items-center gap-3">
                <div className="theme-panel-muted flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-[var(--color-ink)]">
                  {session.user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{session.user.email}</p>
                  <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                    Administrator
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="admin-ghost-btn mt-3 flex w-full items-center justify-center gap-2 rounded-[1.15rem] px-4 py-3 text-sm font-semibold"
            >
              <LogOut size={16} />
              Abmelden
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{opacity: 0, y: 12}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.45}}
              className="admin-card rounded-[2rem] p-5 sm:p-6 lg:p-8"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="section-eyebrow mb-5">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                    Dashboard
                  </div>
                  <h1 className="font-heading text-[2.35rem] font-semibold tracking-[-0.055em] text-[var(--color-ink)]">
                    Anfragen verwalten
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">
                    Neue Anfragen prüfen, bearbeiten und abschließen.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
                    <input
                      type="text"
                      placeholder="Suchen..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="admin-input rounded-[1rem] py-3 pl-9 pr-4 text-sm"
                    />
                  </div>

                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="admin-input appearance-none rounded-[1rem] py-3 pl-10 pr-9 text-sm"
                    >
                      <option value="all">Alle Status</option>
                      <option value="pending">Neu</option>
                      <option value="reviewing">In Bearbeitung</option>
                      <option value="completed">Abgeschlossen</option>
                    </select>
                  </div>

                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="admin-ghost-btn rounded-[1rem] p-3 disabled:opacity-70"
                    title="Daten aktualisieren"
                  >
                    <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-[var(--color-accent)]' : ''} />
                  </button>

                  <button
                    onClick={exportToCSV}
                    className="admin-solid-btn inline-flex items-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">CSV exportieren</span>
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Gesamte Anfragen" value={stats.total} icon={<Inbox size={22} />} />
              <StatCard title="Neu" value={stats.pending} icon={<Clock size={22} />} trend="Offen" tone="amber" />
              <StatCard title="In Bearbeitung" value={stats.reviewing} icon={<Loader2 size={22} />} trend="In Arbeit" tone="blue" />
              <StatCard title="Abgeschlossen" value={stats.completed} icon={<CheckCircle size={22} />} trend="Erledigt" tone="emerald" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="admin-card rounded-[2rem] p-5 sm:p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="theme-panel-muted flex h-11 w-11 items-center justify-center rounded-[1rem] text-[var(--color-accent)]">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
                      Anfragen der letzten 7 Tage
                    </h2>
                    <p className="text-sm text-[var(--color-text-muted)]">Neue Anfragen pro Tag</p>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{top: 8, right: 8, left: -22, bottom: 0}}>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border)" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{fill: 'var(--color-text-muted)', fontSize: 12}}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{fill: 'var(--color-text-muted)', fontSize: 12}}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{fill: 'var(--color-accent-soft)'}}
                        contentStyle={{
                          borderRadius: '16px',
                          border: '1px solid var(--color-border)',
                          background: 'var(--color-surface-strong)',
                          boxShadow: '0 18px 40px -24px rgba(15,23,42,0.35)',
                          color: 'var(--color-ink)',
                        }}
                      />
                      <Bar dataKey="Anfragen" fill="var(--color-accent)" radius={[8, 8, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="admin-card rounded-[2rem] p-5 sm:p-6">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                  Schnellstatus
                </div>
                <div className="mt-4 space-y-3">
                  <QuickStatus label="Neu eingegangen" value={stats.pending} tone="amber" />
                  <QuickStatus label="In Bearbeitung" value={stats.reviewing} tone="blue" />
                  <QuickStatus label="Abgeschlossen" value={stats.completed} tone="emerald" />
                </div>
                <div className="admin-card-muted mt-6 rounded-[1.5rem] p-4">
                  <div className="text-sm font-semibold text-[var(--color-ink)]">Hinweis</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                    Anfrage öffnen, um Angaben und Dokumente zu prüfen.
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-card mt-6 overflow-hidden rounded-[2rem]">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-5 sm:px-6">
                <div>
                  <h2 className="font-heading text-xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
                    Aktuelle Anfragen
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {filteredRequests.length} Einträge nach Ihren aktuellen Filtern
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                      <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Kunde</th>
                      <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Immobilie</th>
                      <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Datum</th>
                      <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Status</th>
                      <th className="px-6 py-4 text-right text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Aktion</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--color-border)]">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <Loader2 className="mx-auto mb-3 animate-spin text-[var(--color-accent)]" size={28} />
                          <p className="text-sm font-medium text-[var(--color-text-muted)]">Anfragen werden geladen</p>
                        </td>
                      </tr>
                    ) : filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-24 text-center">
                          <div className="theme-panel-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.3rem] text-[var(--color-text-muted)]">
                            <Inbox size={28} />
                          </div>
                          <p className="text-lg font-semibold text-[var(--color-ink)]">Keine Anfragen gefunden</p>
                          <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-[var(--color-text-muted)]">
                            Es gibt aktuell keine Anfragen, die Ihren Filterkriterien entsprechen.
                          </p>
                          {requests.length === 0 && (
                            <Link
                              href="/#anfrage"
                              target="_blank"
                              className="admin-ghost-btn mt-6 inline-flex items-center gap-2 rounded-[1rem] px-5 py-3 text-sm font-semibold"
                            >
                              <ExternalLink size={16} />
                              Test-Anfrage erstellen
                            </Link>
                          )}
                        </td>
                      </tr>
                    ) : (
                      paginatedRequests.map((req) => (
                        <tr
                          key={req.id}
                          className="group cursor-pointer transition-colors hover:bg-[var(--color-surface)]"
                          onClick={() => setSelectedRequest(req)}
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-[var(--color-ink)]">{req.name}</div>
                            <div className="mt-1 text-sm text-[var(--color-text-muted)]">{req.email}</div>
                            <div className="mt-2">
                              <SourceBadge source={req.source} />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-[260px] truncate text-sm text-[var(--color-ink)]">{req.address}</div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                              <FileText size={12} className="text-[var(--color-text-muted)]" />
                              {formatDocumentCount(req.documents?.length || 0)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">
                            {new Date(req.created_at).toLocaleDateString('de-DE', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRequest(req);
                                }}
                                className="admin-ghost-btn rounded-[0.9rem] p-2"
                                title="Details ansehen"
                              >
                                <MoreHorizontal size={18} />
                              </button>
                              <button
                                onClick={(e) => deleteRequest(req.id, e)}
                                className="rounded-[0.9rem] border border-red-200/60 bg-red-50/70 p-2 text-red-600 transition-colors hover:bg-red-100"
                                title="Anfrage löschen"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col gap-4 border-t border-[var(--color-border)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-[var(--color-text-muted)]">
                    Zeige{' '}
                    <span className="font-semibold text-[var(--color-ink)]">{(visiblePage - 1) * itemsPerPage + 1}</span> bis{' '}
                    <span className="font-semibold text-[var(--color-ink)]">
                      {Math.min(visiblePage * itemsPerPage, filteredRequests.length)}
                    </span>{' '}
                    von <span className="font-semibold text-[var(--color-ink)]">{filteredRequests.length}</span> Einträgen
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(visiblePage - 1, 1))}
                      disabled={visiblePage === 1}
                      className="admin-ghost-btn rounded-[0.9rem] p-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({length: totalPages}, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`h-9 w-9 rounded-[0.9rem] text-sm font-semibold transition-colors ${
                            visiblePage === page
                              ? 'bg-[var(--color-btn-bg)] text-[var(--color-btn-text)]'
                              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(visiblePage + 1, totalPages))}
                      disabled={visiblePage === totalPages}
                      className="admin-ghost-btn rounded-[0.9rem] p-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {selectedRequest && (
          <RequestDetailsPanel
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onUpdateStatus={updateRequestStatus}
            onDelete={(id) => {
              setRequestToDelete(id);
              setIsDeleteModalOpen(true);
            }}
            onToast={addToast}
          />
        )}
      </AnimatePresence>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRequestToDelete(null);
        }}
        onConfirm={confirmDelete}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  tone = 'blue',
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: string;
  tone?: 'amber' | 'blue' | 'emerald';
}) {
  const toneClasses = {
    amber: 'text-amber-600 bg-amber-500/10',
    blue: 'text-[var(--color-accent)] bg-[var(--color-accent-soft)]',
    emerald: 'text-emerald-600 bg-emerald-500/10',
  };

  return (
    <div className="admin-card relative overflow-hidden rounded-[1.7rem] p-5">
      <div className="pointer-events-none absolute right-4 top-4 text-[var(--color-border-strong)] opacity-40">{icon}</div>
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-[1rem] ${toneClasses[tone]}`}>{icon}</div>
        <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>
      </div>
      <div className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-ink)]">{value}</div>
      {trend && (
        <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {trend}
        </div>
      )}
    </div>
  );
}

function QuickStatus({label, value, tone}: {label: string; value: number; tone: 'amber' | 'blue' | 'emerald'}) {
  const toneDot = {
    amber: 'bg-amber-500',
    blue: 'bg-[var(--color-accent)]',
    emerald: 'bg-emerald-500',
  };

  return (
    <div className="admin-card-muted flex items-center justify-between rounded-[1.25rem] px-4 py-4">
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${toneDot[tone]}`} />
        <span className="text-sm font-medium text-[var(--color-text-muted)]">{label}</span>
      </div>
      <span className="text-lg font-semibold text-[var(--color-ink)]">{value}</span>
    </div>
  );
}

function formatDocumentCount(count: number) {
  return `${count} ${count === 1 ? 'Dokument' : 'Dokumente'}`;
}

function getSourceLabel(source?: string | null) {
  if (source === 'rnd_estimate') return 'Ersteinschätzung';
  return source === 'quick_check' ? 'Schnellcheck' : 'Anfrageformular';
}

function SourceBadge({source}: {source?: string | null}) {
  const isQuickCheck = source === 'quick_check';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${
        isQuickCheck
          ? 'border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]'
      }`}
    >
      {getSourceLabel(source)}
    </span>
  );
}
function StatusBadge({status}: {status: string}) {
  const styles = {
    pending: 'border-amber-200/60 bg-amber-50 text-amber-700',
    reviewing: 'border-blue-200/60 bg-blue-50 text-blue-700',
    completed: 'border-emerald-200/60 bg-emerald-50 text-emerald-700',
  };

  const labels = {
    pending: 'Neu',
    reviewing: 'In Bearbeitung',
    completed: 'Abgeschlossen',
  };

  const style = styles[status as keyof typeof styles] || styles.pending;
  const label = labels[status as keyof typeof labels] || status;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm ${style}`}>
      {status === 'pending' && <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />}
      {status === 'reviewing' && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />}
      {status === 'completed' && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />}
      {label}
    </span>
  );
}



