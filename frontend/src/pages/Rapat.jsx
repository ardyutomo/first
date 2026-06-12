import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { useToast } from '../components/Toast';

const columns = [
  { key: 'nama_kegiatan', label: 'Nama Kegiatan' },
  { key: 'pelaksana_kegiatan', label: 'Pelaksana Kegiatan' },
  { key: 'tanggal_diajukan', label: 'Tanggal Diajukan', type: 'date' },
  { key: 'nominal', label: 'Nominal', type: 'currency' },
];

const exportColumns = [
  { key: 'nama_kegiatan', label: 'Nama Kegiatan' },
  { key: 'pelaksana_kegiatan', label: 'Pelaksana Kegiatan' },
  { key: 'tanggal_diajukan', label: 'Tanggal Diajukan', type: 'date' },
  { key: 'nominal', label: 'Nominal', type: 'currency' },
];

export default function Rapat() {
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

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await api.get('/rapat', { params });
      setData(res.data.data);
    } catch {
      addToast('Gagal memuat data rapat', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setEditRow(null);
    reset({ nama_kegiatan: '', pelaksana_kegiatan: '', tanggal_diajukan: '', nominal: '' });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditRow(row);
    reset({
      nama_kegiatan: row.nama_kegiatan,
      pelaksana_kegiatan: row.pelaksana_kegiatan,
      tanggal_diajukan: row.tanggal_diajukan,
      nominal: row.nominal,
    });
    setModalOpen(true);
  };

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      if (editRow) {
        await api.put(`/rapat/${editRow.id}`, formData);
        addToast('Data rapat berhasil diperbarui');
      } else {
        await api.post('/rapat', formData);
        addToast('Data rapat berhasil ditambahkan');
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
      await api.delete(`/rapat/${deleteRow.id}`);
      addToast('Data rapat berhasil dihapus');
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
        <h2 className="text-xl font-bold text-gray-800">Data Rapat</h2>
        <p className="text-sm text-gray-500 mt-1">Kelola pengajuan kegiatan rapat beserta nominal anggaran</p>
      </div>

      <DataTable
        title="Rapat"
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
        exportFilename="data_rapat"
        exportTitle="Laporan Data Rapat"
        exportColumns={exportColumns}
      />

      {/* Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editRow ? 'Edit Data Rapat' : 'Tambah Data Rapat'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Nama Kegiatan <span className="text-red-500">*</span></label>
            <input
              type="text"
              {...register('nama_kegiatan', { required: 'Nama kegiatan wajib diisi' })}
              className={`form-input ${errors.nama_kegiatan ? 'border-red-400' : ''}`}
              placeholder="Masukkan nama kegiatan rapat"
            />
            {errors.nama_kegiatan && <p className="text-xs text-red-600 mt-1">{errors.nama_kegiatan.message}</p>}
          </div>

          <div>
            <label className="form-label">Pelaksana Kegiatan <span className="text-red-500">*</span></label>
            <input
              type="text"
              {...register('pelaksana_kegiatan', { required: 'Pelaksana kegiatan wajib diisi' })}
              className={`form-input ${errors.pelaksana_kegiatan ? 'border-red-400' : ''}`}
              placeholder="Masukkan nama pelaksana kegiatan"
            />
            {errors.pelaksana_kegiatan && <p className="text-xs text-red-600 mt-1">{errors.pelaksana_kegiatan.message}</p>}
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
              placeholder="Contoh: 5000000"
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
        title="Hapus Data Rapat"
        message={`Apakah Anda yakin ingin menghapus data rapat "${deleteRow?.nama_kegiatan}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
