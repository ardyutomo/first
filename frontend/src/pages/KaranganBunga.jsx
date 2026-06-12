import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { useToast } from '../components/Toast';

const columns = [
  { key: 'text_ucapan', label: 'Teks Ucapan', type: 'longtext' },
  { key: 'pengirim', label: 'Pengirim' },
  { key: 'tanggal_diajukan', label: 'Tanggal Diajukan', type: 'date' },
  { key: 'nominal', label: 'Nominal', type: 'currency' },
];

const exportColumns = [
  { key: 'text_ucapan', label: 'Teks Ucapan' },
  { key: 'pengirim', label: 'Pengirim' },
  { key: 'tanggal_diajukan', label: 'Tanggal Diajukan', type: 'date' },
  { key: 'nominal', label: 'Nominal', type: 'currency' },
];

export default function KaranganBunga() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { toasts, addToast, removeToast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await api.get('/karangan-bunga', { params });
      setData(res.data.data);
    } catch {
      addToast('Gagal memuat data karangan bunga', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setEditRow(null);
    reset({ text_ucapan: '', pengirim: '', tanggal_diajukan: '', nominal: '' });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditRow(row);
    reset({
      text_ucapan: row.text_ucapan,
      pengirim: row.pengirim,
      tanggal_diajukan: row.tanggal_diajukan,
      nominal: row.nominal,
    });
    setModalOpen(true);
  };

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      if (editRow) {
        await api.put(`/karangan-bunga/${editRow.id}`, formData);
        addToast('Data karangan bunga berhasil diperbarui');
      } else {
        await api.post('/karangan-bunga', formData);
        addToast('Data karangan bunga berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Gagal menyimpan data', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/karangan-bunga/${deleteRow.id}`);
      addToast('Data karangan bunga berhasil dihapus');
      setDeleteRow(null);
      fetchData();
    } catch {
      addToast('Gagal menghapus data', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Data Karangan Bunga</h2>
        <p className="text-sm text-gray-500 mt-1">Kelola pengajuan karangan bunga beserta nominal anggaran</p>
      </div>

      <DataTable
        title="Karangan Bunga"
        data={data}
        columns={columns}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={setDeleteRow}
        search={search}
        setSearch={setSearch}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        exportFilename="data_karangan_bunga"
        exportTitle="Laporan Data Karangan Bunga"
        exportColumns={exportColumns}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editRow ? 'Edit Data Karangan Bunga' : 'Tambah Data Karangan Bunga'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Teks Ucapan <span className="text-red-500">*</span></label>
            <textarea
              {...register('text_ucapan', { required: 'Teks ucapan wajib diisi' })}
              className={`form-input min-h-[100px] resize-y ${errors.text_ucapan ? 'border-red-400' : ''}`}
              placeholder="Masukkan teks ucapan karangan bunga"
              rows={3}
            />
            {errors.text_ucapan && <p className="text-xs text-red-600 mt-1">{errors.text_ucapan.message}</p>}
          </div>

          <div>
            <label className="form-label">Pengirim <span className="text-red-500">*</span></label>
            <input
              type="text"
              {...register('pengirim', { required: 'Pengirim wajib diisi' })}
              className={`form-input ${errors.pengirim ? 'border-red-400' : ''}`}
              placeholder="Masukkan nama pengirim"
            />
            {errors.pengirim && <p className="text-xs text-red-600 mt-1">{errors.pengirim.message}</p>}
          </div>

          <div>
            <label className="form-label">Tanggal Diajukan <span className="text-red-500">*</span></label>
            <input
              type="date"
              {...register('tanggal_diajukan', { required: 'Tanggal diajukan wajib diisi' })}
              className={`form-input ${errors.tanggal_diajukan ? 'border-red-400' : ''}`}
            />
            {errors.tanggal_diajukan && <p className="text-xs text-red-600 mt-1">{errors.tanggal_diajukan.message}</p>}
          </div>

          <div>
            <label className="form-label">Nominal (Rp) <span className="text-red-500">*</span></label>
            <input
              type="number"
              {...register('nominal', {
                required: 'Nominal wajib diisi',
                min: { value: 0, message: 'Nominal tidak boleh negatif' }
              })}
              className={`form-input ${errors.nominal ? 'border-red-400' : ''}`}
              placeholder="Contoh: 500000"
            />
            {errors.nominal && <p className="text-xs text-red-600 mt-1">{errors.nominal.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editRow ? 'Simpan Perubahan' : 'Tambah Data'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Hapus Data Karangan Bunga"
        message={`Apakah Anda yakin ingin menghapus data karangan bunga dari "${deleteRow?.pengirim}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
