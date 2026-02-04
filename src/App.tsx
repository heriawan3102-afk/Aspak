import { useState } from "react";
import { cn } from "@/utils/cn";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type TabType = "dashboard" | "laporan" | "pencatatan" | "dokumentasi" | "perencanaan" | "faskes" | "unduh" | "pengaturan";

interface Faskes {
  id: number;
  nama: string;
}

interface AlatKesehatan {
  id: number;
  faskesId: number;
  nama: string;
  kategori: string;
  jumlah: number;
  kondisi: string;
  lokasi: string;
  terakhirDiperiksa: string;
  gambar?: string;
}

interface Laporan {
  id: number;
  faskesId: number;
  judul: string;
  jenis: string;
  tanggal: string;
  pelapor: string;
  status: string;
  deskripsi?: string;
  foto?: string;
}

interface Usulan {
  id: number;
  faskesId: number;
  namaAlat: string;
  jumlah: number;
  kebutuhan: string;
  prioritas: "tinggi" | "sedang" | "rendah";
  status: string;
  pengusul: string;
}

const FASKES_LIST: Faskes[] = [
  { id: 1, nama: "BAGENDIT" }, { id: 2, nama: "BAYONGBONG DTP" }, { id: 3, nama: "BOJONGLOA" },
  { id: 4, nama: "CEMPAKA" }, { id: 5, nama: "CIBALONG" }, { id: 6, nama: "CIBIUK" },
  { id: 7, nama: "CIHURIP" }, { id: 8, nama: "CIKAJANG DTP" }, { id: 9, nama: "CILIMUS" },
  { id: 10, nama: "CIMARAGAS" }, { id: 11, nama: "CIMARI" }, { id: 12, nama: "CIPANAS" },
  { id: 13, nama: "CISANDAAN" }, { id: 14, nama: "CISEWU DTP" }, { id: 15, nama: "CITERAS" },
  { id: 16, nama: "GADOG" }, { id: 17, nama: "GARAWANGSA" }, { id: 18, nama: "GUNTUR" },
  { id: 19, nama: "HAUR PANGGUNG" }, { id: 20, nama: "KADUNGORA" }, { id: 21, nama: "KARANGMULYA" },
  { id: 22, nama: "KARANGPAWITAN" }, { id: 23, nama: "KARANGSARI" }, { id: 24, nama: "KARANGTENGAH" },
  { id: 25, nama: "KERSAMENAK" }, { id: 26, nama: "LELES DTP" }, { id: 27, nama: "LEMBANG" },
  { id: 28, nama: "LEUWIGOONG" }, { id: 29, nama: "MALANGBONG DTP" }, { id: 30, nama: "MAROKO" },
  { id: 31, nama: "MEKARMUKTI" }, { id: 32, nama: "MEKARWANGI" }, { id: 33, nama: "PADAAWAS" },
  { id: 34, nama: "PAKUWON" }, { id: 35, nama: "PAMEUNGPEUK DTP" }, { id: 36, nama: "PAMULIHAN" },
  { id: 37, nama: "PASUNDAN" }, { id: 38, nama: "PEMBANGUNAN" }, { id: 39, nama: "PEUNDEUY" },
  { id: 40, nama: "RANCASALAK" }, { id: 41, nama: "SAMARANG" }, { id: 42, nama: "SILIWANGI" },
  { id: 43, nama: "SINGA JAYA DTP" }, { id: 44, nama: "SUKA MUKTI" }, { id: 45, nama: "SUKA RAME" },
  { id: 46, nama: "SUKA SENANG" }, { id: 47, nama: "SUKAHURIP" }, { id: 48, nama: "SUKAKARYA" },
  { id: 49, nama: "SUKAMERANG" }, { id: 50, nama: "SUKAMULYA" }, { id: 51, nama: "SUKARAJA" },
  { id: 52, nama: "SUKAWENING" }, { id: 53, nama: "TALEGONG" }, { id: 54, nama: "TAROGONG DTP" },
  { id: 55, nama: "TEGAL GEDE" },
];

const ALAT_IMAGES: Record<string, string> = {
  "default": "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=400&h=300&fit=crop"
};

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<string>("");
  const [selectedFaskes, setSelectedFaskes] = useState<number>(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAlat, setSelectedAlat] = useState<AlatKesehatan | null>(null);
  const [selectedLaporan, setSelectedLaporan] = useState<Laporan | null>(null);
  const [showLaporanDetail, setShowLaporanDetail] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [apiUrl, setApiUrl] = useState<string>(localStorage.getItem("aspak_api_url") || "");
  const [isSyncing, setIsSyncing] = useState(false);

  // Mock Data
  const [alatKesehatan, setAlatKesehatan] = useState<AlatKesehatan[]>([
    { id: 1, faskesId: 1, nama: "Ventilator Mekanik", kategori: "ICU", jumlah: 5, kondisi: "Baik", lokasi: "Ruang ICU", terakhirDiperiksa: "2024-01-15", gambar: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&h=300&fit=crop" },
    { id: 2, faskesId: 1, nama: "Monitor Pasien", kategori: "Perawatan", jumlah: 12, kondisi: "Baik", lokasi: "Ruang Perawatan", terakhirDiperiksa: "2024-01-14", gambar: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=300&fit=crop" },
  ]);

  const [laporan, setLaporan] = useState<Laporan[]>([
    { id: 1, faskesId: 1, judul: "Kerusakan Ventilator ICU", jenis: "Kerusakan", tanggal: "2024-01-15", pelapor: "Dr. Budi", status: "Proses", deskripsi: "Ventilator di ruang ICU mengalami kerusakan.", foto: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&h=300&fit=crop" },
  ]);

  const [usulan, setUsulan] = useState<Usulan[]>([
    { id: 1, faskesId: 1, namaAlat: "Ventilator Portable", jumlah: 2, kebutuhan: "ICU Mobile", prioritas: "tinggi", status: "Menunggu", pengusul: "Dr. Siti" },
  ]);

  const handleOpenModal = (type: string) => {
    setModalType(type);
    setFormData({ faskesId: selectedFaskes || 1 });
    setShowModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const syncFromSpreadsheet = async () => {
    if (!apiUrl) return;
    setIsSyncing(true);
    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      if (data.tools) setAlatKesehatan(data.tools);
      if (data.reports) setLaporan(data.reports);
      if (data.plans) setUsulan(data.plans);
      alert("Data berhasil disinkronkan!");
    } catch (err) {
      console.error(err);
      alert("Gagal sinkronisasi data.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSubmit = async () => {
    const currentDate = new Date().toISOString().split('T')[0];
    let newData: any = { ...formData, id: Date.now(), faskesId: formData.faskesId || selectedFaskes || 1 };
    let target = "";

    if (modalType === "laporan") {
      target = "Reports";
      newData = { ...newData, tanggal: currentDate, status: "Proses" };
      setLaporan([...laporan, newData]);
    } else if (modalType === "alat") {
      target = "Tools";
      newData = { ...newData, terakhirDiperiksa: currentDate, gambar: formData.gambar || ALAT_IMAGES["default"] };
      setAlatKesehatan([...alatKesehatan, newData]);
    } else if (modalType === "usulan") {
      target = "Plans";
      newData = { ...newData, status: "Menunggu" };
      setUsulan([...usulan, newData]);
    }

    if (apiUrl && target) {
      try {
        await fetch(apiUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target, data: Object.values(newData) })
        });
      } catch (err) {
        console.error("API Error:", err);
      }
    }

    setShowModal(false);
    setFormData({});
  };

  const getFilteredData = <T extends { faskesId: number }>(data: T[]): T[] => {
    return selectedFaskes === 0 ? data : data.filter(item => item.faskesId === selectedFaskes);
  };

  const getFaskesName = (id: number) => {
    const faskes = FASKES_LIST.find(f => f.id === id);
    return faskes ? `Puskesmas ${faskes.nama}` : "Unknown";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Baik": return "bg-emerald-100 text-emerald-700";
      case "Perlu Perbaikan": return "bg-rose-100 text-rose-700";
      case "Proses": return "bg-sky-100 text-sky-700";
      case "Selesai": return "bg-emerald-100 text-emerald-700";
      case "Disetujui": return "bg-emerald-100 text-emerald-700";
      case "Menunggu": return "bg-amber-100 text-amber-700";
      case "Diproses": return "bg-sky-100 text-sky-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const downloadPDF = (type: string) => {
    const doc = new jsPDF();
    const faskesName = selectedFaskes === 0 ? "SEMUA PUSKESMAS" : getFaskesName(selectedFaskes);
    const date = new Date().toLocaleDateString('id-ID');

    doc.setFontSize(18);
    doc.text("LAPORAN ASPAK - " + type.toUpperCase(), 14, 22);
    doc.setFontSize(11);
    doc.text(`Faskes: ${faskesName}`, 14, 30);
    doc.text(`Tanggal: ${date}`, 14, 37);

    if (type === 'Inventaris') {
      const data = getFilteredData(alatKesehatan).map(a => [a.nama, a.kategori, a.jumlah, a.kondisi, a.lokasi]);
      autoTable(doc, {
        startY: 45,
        head: [['Nama Alat', 'Kategori', 'Jumlah', 'Kondisi', 'Lokasi']],
        body: data,
      });
    } else if (type === 'Laporan') {
      const data = getFilteredData(laporan).map(l => [l.judul, l.jenis, l.tanggal, l.pelapor, l.status]);
      autoTable(doc, {
        startY: 45,
        head: [['Judul', 'Jenis', 'Tanggal', 'Pelapor', 'Status']],
        body: data,
      });
    } else if (type === 'Usulan') {
      const data = getFilteredData(usulan).map(u => [u.namaAlat, u.jumlah, u.prioritas, u.status, u.pengusul]);
      autoTable(doc, {
        startY: 45,
        head: [['Nama Alat', 'Jumlah', 'Prioritas', 'Status', 'Pengusul']],
        body: data,
      });
    }

    doc.save(`ASPAK_${type}_${faskesName}_${date}.pdf`);
  };

  // Components for each page
  const Dashboard = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Faskes Selector Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-3">
          <span className="text-xl">📍</span> Pilih Puskesmas
        </label>
        <div className="relative">
          <select 
            value={selectedFaskes} 
            onChange={(e) => setSelectedFaskes(Number(e.target.value))}
            className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm font-medium appearance-none"
          >
            <option value={0}>Semua Puskesmas</option>
            {FASKES_LIST.map(f => (
              <option key={f.id} value={f.id}>Puskesmas {f.nama}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Total Alat", val: getFilteredData(alatKesehatan).reduce((s, a) => s + a.jumlah, 0), icon: "📦", color: "from-blue-500 to-blue-600" },
          { label: "Kondisi Baik", val: getFilteredData(alatKesehatan).filter(a => a.kondisi === "Baik").length, icon: "✅", color: "from-emerald-500 to-emerald-600" },
          { label: "Rusak/RSK", val: getFilteredData(alatKesehatan).filter(a => a.kondisi !== "Baik").length, icon: "⚠️", color: "from-rose-500 to-rose-600" },
          { label: "Usulan", val: getFilteredData(usulan).length, icon: "💡", color: "from-amber-500 to-amber-600" },
        ].map((stat, i) => (
          <div key={i} className={cn("relative overflow-hidden rounded-2xl p-4 text-white shadow-lg bg-gradient-to-br", stat.color)}>
            <div className="relative z-10">
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black mt-1">{stat.val}</p>
            </div>
            <span className="absolute -right-2 -bottom-2 text-5xl opacity-20 rotate-12">{stat.icon}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          AKSI CEPAT
        </h3>
        <div className="grid grid-cols-1 gap-2">
          <button onClick={() => handleOpenModal("laporan")} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl active:scale-95 transition-all">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">📝</div>
            <div className="text-left">
              <p className="font-bold text-slate-800 text-sm">Buat Laporan</p>
              <p className="text-[10px] text-slate-500">Catat temuan atau kerusakan</p>
            </div>
            <svg className="w-5 h-5 ml-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <button onClick={() => handleOpenModal("alat")} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl active:scale-95 transition-all">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">➕</div>
            <div className="text-left">
              <p className="font-bold text-slate-800 text-sm">Tambah Alat</p>
              <p className="text-[10px] text-slate-500">Input data alat kesehatan baru</p>
            </div>
            <svg className="w-5 h-5 ml-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );

  const LaporanPage = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black text-slate-800">📋 Laporan</h2>
        <button onClick={() => handleOpenModal("laporan")} className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
      <div className="space-y-3">
        {getFilteredData(laporan).map(lap => (
          <div key={lap.id} onClick={() => { setSelectedLaporan(lap); setShowLaporanDetail(true); }} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden active:bg-slate-50 transition-colors">
            {lap.foto && <img src={lap.foto} className="w-full h-32 object-cover" alt="" />}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className={cn("px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest", getStatusColor(lap.status))}>{lap.status}</span>
                <span className="text-[10px] font-bold text-slate-400">{lap.tanggal}</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">{lap.judul}</h3>
              <p className="text-[10px] text-slate-500 line-clamp-1">{getFaskesName(lap.faskesId)} • {lap.pelapor}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AlatPage = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black text-slate-800">🔧 Inventaris</h2>
        <button onClick={() => handleOpenModal("alat")} className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {getFilteredData(alatKesehatan).map(alat => (
          <div key={alat.id} onClick={() => { setSelectedAlat(alat); setShowDetailModal(true); }} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex active:bg-slate-50 transition-colors">
            <div className="w-24 h-24 bg-slate-100 shrink-0">
              <img src={alat.gambar || ALAT_IMAGES["default"]} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="p-3 flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="font-bold text-slate-800 text-sm truncate">{alat.nama}</h3>
              <p className="text-[10px] text-slate-500 mt-1">{alat.kategori} • {alat.jumlah} Unit</p>
              <div className="mt-2 flex items-center justify-between">
                <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider", getStatusColor(alat.kondisi))}>{alat.kondisi}</span>
                <span className="text-[9px] font-bold text-slate-400">📍 {alat.lokasi}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const UsulanPage = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black text-slate-800">💡 Usulan</h2>
        <button onClick={() => handleOpenModal("usulan")} className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
      <div className="space-y-3">
        {getFilteredData(usulan).map(u => (
          <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col gap-1">
                <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider inline-block w-fit", 
                  u.prioritas === "tinggi" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                )}>PRIORITAS {u.prioritas}</span>
                <h3 className="font-bold text-slate-800 text-sm">{u.namaAlat}</h3>
              </div>
              <span className={cn("px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest", getStatusColor(u.status))}>{u.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
              <p>🔢 <span className="font-bold">{u.jumlah} Unit</span></p>
              <p>📍 <span className="font-bold">{u.kebutuhan}</span></p>
              <p>👤 <span className="font-bold">{u.pengusul}</span></p>
              <p>🏥 <span className="font-bold truncate">{getFaskesName(u.faskesId)}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const UnduhPage = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="px-1">
        <h2 className="text-xl font-black text-slate-800">📥 Pusat Unduhan</h2>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Ekspor data faskes ke format PDF</p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {[
          { label: "Daftar Inventaris Alat", type: "Inventaris", icon: "🔧", color: "bg-emerald-50 text-emerald-600" },
          { label: "Laporan Monitoring", type: "Laporan", icon: "📋", color: "bg-blue-50 text-blue-600" },
          { label: "Perencanaan Usulan", type: "Usulan", icon: "💡", color: "bg-amber-50 text-amber-600" },
        ].map((item, i) => (
          <button 
            key={i} 
            onClick={() => downloadPDF(item.type)}
            className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl active:scale-95 transition-all shadow-sm"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", item.color)}>
              {item.icon}
            </div>
            <div className="text-left flex-1">
              <p className="font-black text-slate-800 text-sm">{item.label}</p>
              <p className="text-[10px] font-bold text-slate-400">UNDUH FORMAT PDF</p>
            </div>
            <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </div>
          </button>
        ))}
      </div>

      <div className="p-6 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-lg font-black mb-1">Informasi</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Data yang diunduh mencakup filter puskesmas yang sedang aktif ({selectedFaskes === 0 ? "Semua" : getFaskesName(selectedFaskes)}).
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 text-7xl opacity-10 rotate-12">📄</div>
      </div>
    </div>
  );

  const ModalSheet = () => {
    if (!showModal) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
        <div className="relative w-full sm:max-w-lg bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full duration-300">
          {/* Handle bar for mobile */}
          <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {modalType === "laporan" ? "📝 LAPORAN BARU" : 
                 modalType === "alat" ? "🔧 TAMBAH ALAT" : 
                 modalType === "dokumentasi" ? "📸 DOKUMENTASI" : "💡 USULAN BARU"}
              </h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {modalType === "laporan" && (
                <>
                  <Input label="Judul Laporan" placeholder="Contoh: Kerusakan Lampu Operasi" onChange={(v: string) => setFormData({...formData, judul: v})} />
                  <Select label="Jenis Laporan" options={["Kerusakan", "Pemeliharaan", "Kalibrasi"]} onChange={(v: string) => setFormData({...formData, jenis: v})} />
                  <Input label="Pelapor" placeholder="Nama Anda" onChange={(v: string) => setFormData({...formData, pelapor: v})} />
                  <Textarea label="Deskripsi Kejadian" placeholder="..." onChange={(v: string) => setFormData({...formData, deskripsi: v})} />
                  <FileInput label="Foto Bukti (Opsional)" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleImageUpload(e, 'foto')} preview={formData.foto} />
                </>
              )}
              {modalType === "alat" && (
                <>
                  <Input label="Nama Alat" placeholder="Contoh: Stetoskop Digital" onChange={(v: string) => setFormData({...formData, nama: v})} />
                  <Select label="Kategori" options={["ICU", "IGD", "POLI", "LAB"]} onChange={(v: string) => setFormData({...formData, kategori: v})} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Jumlah" type="number" placeholder="0" onChange={(v: string) => setFormData({...formData, jumlah: parseInt(v)})} />
                    <Select label="Kondisi" options={["Baik", "Perlu Perbaikan"]} onChange={(v: string) => setFormData({...formData, kondisi: v})} />
                  </div>
                  <Input label="Lokasi Penempatan" placeholder="Ruang Periksa 1" onChange={(v: string) => setFormData({...formData, lokasi: v})} />
                  <FileInput label="Foto Alat" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleImageUpload(e, 'gambar')} preview={formData.gambar} />
                </>
              )}
              {modalType === "usulan" && (
                <>
                  <Input label="Nama Alat Diusulkan" placeholder="Contoh: Bed Pasien Elektrik" onChange={(v: string) => setFormData({...formData, namaAlat: v})} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Jumlah" type="number" placeholder="0" onChange={(v: string) => setFormData({...formData, jumlah: parseInt(v)})} />
                    <Select label="Prioritas" options={["tinggi", "sedang", "rendah"]} onChange={(v: string) => setFormData({...formData, prioritas: v})} />
                  </div>
                  <Input label="Kebutuhan Ruangan" placeholder="Ruang Rawat Inap A" onChange={(v: string) => setFormData({...formData, kebutuhan: v})} />
                  <Input label="Pengusul" placeholder="Nama Pengusul" onChange={(v: string) => setFormData({...formData, pengusul: v})} />
                </>
              )}
              <Select 
                label="Lokasi Puskesmas" 
                value={formData.faskesId}
                options={FASKES_LIST.map(f => `Puskesmas ${f.nama}`)} 
                onChange={(v: string) => {
                  const f = FASKES_LIST.find(f => `Puskesmas ${f.nama}` === v);
                  if(f) setFormData({...formData, faskesId: f.id});
                }} 
              />
            </div>

            <button onClick={handleSubmit} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-sm mt-6 shadow-xl active:scale-95 transition-all">
              SIMPAN DATA
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-32">
      {/* Header Mobile - Dynamic Title */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-200">
            {activeTab === "dashboard" ? "🏠" : 
             activeTab === "laporan" ? "📋" : 
             activeTab === "pencatatan" ? "🔧" : 
             activeTab === "dokumentasi" ? "📸" : "💡"}
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-800 uppercase">
              {activeTab === "dashboard" ? "ASPAK DASHBOARD" : 
               activeTab === "laporan" ? "PELAPORAN" : 
               activeTab === "pencatatan" ? "INVENTARIS" : 
               activeTab === "dokumentasi" ? "DOKUMENTASI" : "PERENCANAAN"}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {selectedFaskes === 0 ? "SELURUH FASKES" : getFaskesName(selectedFaskes)}
            </p>
          </div>
        </div>
        <button onClick={() => setActiveTab("faskes")} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:bg-slate-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
        </button>
      </header>

      {/* Main App Area */}
      <main className="px-6 py-6 max-w-lg mx-auto">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "laporan" && <LaporanPage />}
        {activeTab === "pencatatan" && <AlatPage />}
        {activeTab === "perencanaan" && <UsulanPage />}
        {activeTab === "unduh" && <UnduhPage />}
        {activeTab === "pengaturan" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="px-1">
              <h2 className="text-xl font-black text-slate-800">⚙️ Pengaturan</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Konfigurasi Database Spreadsheet</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Google Apps Script URL</label>
                <input 
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/..."
                  className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700"
                />
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    localStorage.setItem("aspak_api_url", apiUrl);
                    alert("URL Berhasil Disimpan!");
                  }}
                  className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-all"
                >
                  SIMPAN URL
                </button>
                <button 
                  onClick={syncFromSpreadsheet}
                  disabled={isSyncing}
                  className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black text-sm active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSyncing ? "MENYINKRONKAN..." : "SINKRONISASI DATA SEKARANG"}
                </button>
              </div>
            </div>
            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
              <h4 className="text-sm font-black text-amber-800 mb-2">Petunjuk:</h4>
              <ul className="text-[11px] text-amber-700 space-y-2 font-medium">
                <li>1. Gunakan Apps Script sebagai jembatan ke Google Sheets.</li>
                <li>2. Pastikan Web App di-deploy dengan akses "Anyone".</li>
                <li>3. Data akan otomatis terupdate di HP petugas lain yang memiliki URL yang sama.</li>
              </ul>
            </div>
          </div>
        )}
        {activeTab === "faskes" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
             <h2 className="text-xl font-black text-slate-800">🏥 Pilih Faskes</h2>
             <div className="grid grid-cols-1 gap-2">
                {FASKES_LIST.map(f => (
                  <button 
                    key={f.id}
                    onClick={() => { setSelectedFaskes(f.id); setActiveTab("dashboard"); }}
                    className={cn("p-4 text-left rounded-2xl border transition-all font-bold text-sm", 
                      selectedFaskes === f.id ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-700"
                    )}
                  >
                    {f.nama}
                  </button>
                ))}
             </div>
          </div>
        )}
      </main>

      {/* Bottom Navbar - Mobile Ergonomic */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4">
        <div className="max-w-md mx-auto bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] p-1.5 flex justify-between items-center shadow-2xl">
          {[
            { id: "dashboard", icon: "🏠", label: "Home" },
            { id: "laporan", icon: "📋", label: "Lapor" },
            { id: "pencatatan", icon: "🔧", label: "Alat" },
            { id: "perencanaan", icon: "💡", label: "Usul" },
            { id: "unduh", icon: "📥", label: "Unduh" },
            { id: "pengaturan", icon: "⚙️", label: "Set" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn("flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300", 
                activeTab === tab.id ? "bg-blue-600 text-white scale-110 -translate-y-2 shadow-xl shadow-blue-500/40" : "text-slate-400"
              )}
            >
              <span className="text-xl">{tab.icon}</span>
              {activeTab === tab.id && <span className="text-[7px] font-black uppercase mt-1">{tab.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Modals & Detail Sheets */}
      <ModalSheet />
      
      {/* Detail Alat Modal */}
      {showDetailModal && selectedAlat && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowDetailModal(false)} />
          <div className="relative w-full sm:max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
             <img src={selectedAlat.gambar} className="w-full h-56 object-cover" alt="" />
             <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-black text-slate-800">{selectedAlat.nama}</h3>
                  <span className={cn("px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest", getStatusColor(selectedAlat.kondisi))}>{selectedAlat.kondisi}</span>
                </div>
                <div className="space-y-4">
                   <DetailRow label="PUSKESMAS" value={getFaskesName(selectedAlat.faskesId)} icon="🏥" />
                   <DetailRow label="KATEGORI" value={selectedAlat.kategori} icon="📁" />
                   <DetailRow label="JUMLAH" value={`${selectedAlat.jumlah} UNIT`} icon="🔢" />
                   <DetailRow label="LOKASI" value={selectedAlat.lokasi} icon="📍" />
                </div>
                <button onClick={() => setShowDetailModal(false)} className="w-full h-14 bg-slate-100 text-slate-800 rounded-2xl font-black text-sm mt-8 active:scale-95 transition-all">TUTUP</button>
             </div>
          </div>
        </div>
      )}

      {/* Detail Laporan Modal */}
      {showLaporanDetail && selectedLaporan && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowLaporanDetail(false)} />
          <div className="relative w-full sm:max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
             {selectedLaporan.foto && <img src={selectedLaporan.foto} className="w-full h-56 object-cover" alt="" />}
             <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-black text-slate-800">{selectedLaporan.judul}</h3>
                  <span className={cn("px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest", getStatusColor(selectedLaporan.status))}>{selectedLaporan.status}</span>
                </div>
                <div className="space-y-4">
                   <DetailRow label="PELAPOR" value={selectedLaporan.pelapor} icon="👤" />
                   <DetailRow label="TANGGAL" value={selectedLaporan.tanggal} icon="📅" />
                   <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">DESKRIPSI</p>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">{selectedLaporan.deskripsi || "Tidak ada deskripsi"}</p>
                   </div>
                </div>
                <button onClick={() => setShowLaporanDetail(false)} className="w-full h-14 bg-slate-100 text-slate-800 rounded-2xl font-black text-sm mt-8 active:scale-95 transition-all">TUTUP</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components for cleaner code - Optimized for Chrome Mobile (16px font to prevent auto-zoom)
const Input = ({ label, placeholder, type = "text", onChange }: any) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">{label}</label>
    <input 
      type={type}
      placeholder={placeholder}
      className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-base font-bold text-slate-700 placeholder:text-slate-300"
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const Select = ({ label, options, onChange, value }: any) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">{label}</label>
    <div className="relative">
      <select 
        value={value}
        className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-base font-bold text-slate-700 appearance-none"
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Pilih {label}</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
);

const Textarea = ({ label, placeholder, onChange }: any) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">{label}</label>
    <textarea 
      rows={3}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-base font-bold text-slate-700 placeholder:text-slate-300"
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const FileInput = ({ label, onChange, preview }: any) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">{label}</label>
    <div className="relative h-24 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
      {preview ? (
        <img src={preview} className="w-full h-full object-cover" alt="" />
      ) : (
        <div className="text-center">
          <span className="text-2xl">📸</span>
          <p className="text-[10px] font-bold text-slate-400 mt-1">TAP UNTUK UPLOAD</p>
        </div>
      )}
      <input 
        type="file" 
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={onChange}
      />
    </div>
  </div>
);

const DetailRow = ({ label, value, icon }: any) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl shrink-0">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-black text-slate-700">{value}</p>
    </div>
  </div>
);
