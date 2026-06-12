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
  { key: 'nomor_sp', label: 'Nomor SP' },
  { key: 'kota_tujuan', label: 'Kota Tujuan' },
  { key: 'tanggal_mulai', label: 'Tanggal Mulai', type: 'date' },
  { key: 'tanggal_selesai', label: 'Tanggal Selesai', type: 'date' },
  { key: 'pelaksana_kegiatan', label: 'Pelaksana' },
];

const exportColumns = [
  { key: 'nama_kegiatan', label: 'Nama Kegiatan' },
  { key: 'nomor_sp', label: 'Nomor SP' },
  { key: 'kota_tujuan', label: 'Kota Tujuan' },
  { key: 'tanggal_mulai', label: 'Tanggal Mulai', type: 'date' },
  { key: 'tanggal_selesai', label: 'Tanggal Selesai', type: 'date' },
  { key: 'pelaksana_kegiatan', label: 'Pelaksana Kegiatan' },
];

export default function Perjadin() {
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

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
  const tanggalMulai = watch('tanggal_mulai');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await api.get('/perjadin', { params });
      setData(res.data.data);
    } catch {
      addToast('Gagal memuat data perjalanan dinas', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setEditRow(null);
    reset({
      nama_kegiatan: '', nomor_sp: '', kota_tujuan: '',
      tanggal_mulai: '', tanggal_selesai: '', pelaksana_kegiatan: ''
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditRow(row);
    reset({
      nama_kegiatan: row.nama_kegiatan,
      nomor_sp: row.nomor_sp,
      kota_tujuan: row.kota_tujuan,
      tanggal_mulai: row.tanggal_mulai,
      tanggal_selesai: row.tanggal_selesai,
      pelaksana_kegiatan: row.pelaksana_kegiatan,
    });
    setModalOpen(true);
  };

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      if (editRow) {
        await api.put(`/perjadin/${editRow.id}`, formData);
        addToast('Data perjalanan dinas berhasil diperbarui');
      } else {
        await api.post('/perjadin', formData);
        addToast('Data perjalanan dinas berhasil ditambahkan');
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
      await api.delete(`/perjadin/${deleteRow.id}`);
      addToast('Data perjalanan dinas berhasil dihapus');
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
        <h2 className="text-xl font-bold text-gray-800">Data Perjalanan Dinas</h2>
        <p className="text-sm text-gray-500 mt-1">Kelola perjalanan dinas pegawai beserta jadwal dan tujuan</p>
      </div>

      <DataTable
        title="Perjalanan Dinas"
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
        exportFilename="data_perjalanan_dinas"
        exportTitle="Laporan Data Perjalanan Dinas"
        exportColumns={exportColumns}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editRow ? 'Edit Data Perjalanan Dinas' : 'Tambah Data Perjalanan Dinas'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">Nama Kegiatan <span className="text-red-500">*</span></label>
              <input
                type="text"
                {...register('nama_kegiatan', { required: 'Nama kegiatan wajib diisi' })}
                className={`form-input ${errors.nama_kegiatan ? 'border-red-400' : ''}`}
                placeholder="Masukkan nama kegiatan perjalanan dinas"
              />
              {errors.nama_kegiatan && <p className="text-xs text-red-600 mt-1">{errors.nama_kegiatan.message}</p>}
            </div>

            <div>
              <label className="form-label">Nomor SP <span className="text-red-500">*</span></label>
              <input
                type="text"
                {...register('nomor_sp', { required: 'Nomor SP wajib diisi' })}
                className={`form-input ${errors.nomor_sp ? 'border-red-400' : ''}`}
                placeholder="Contoh: SP/001/2024"
              />
              {errors.nomor_sp && <p className="text-xs text-red-600 mt-1">{errors.nomor_sp.message}</p>}
            </div>

            <div>
              <label className="form-label">Kota Tujuan <span className="text-red-500">*</span></label>
              <input
                type="text"
                {...register('kota_tujuan', { required: 'Kota tujuan wajib diisi' })}
                className={`form-input ${errors.kota_tujuan ? 'border-red-400' : ''}`}
                placeholder="Contoh: Jakarta"
              />
              {errors.kota_tujuan && <p className="text-xs text-red-600 mt-1">{errors.kota_tujuan.message}</p>}
            </div>

            <div>
              <label className="form-label">Tanggal Mulai <span className="text-red-500">*</span></label>
              <input
                type="date"
                {...register('tanggal_mulai', { required: 'Tanggal mulai wajib diisi' })}
                className={`form-input ${errors.tanggal_mulai ? 'border-red-400' : ''}`}
              />
              {errors.tanggal_mulai && <p className="text-xs text-red-600 mt-1">{errors.tanggal_mulai.message}</p>}
            </div>

            <div>
              <label className="form-label">Tanggal Selesai <span className="text-red-500">*</span></label>
              <input
                type="date"
                {...register('tanggal_selesai', {
                  required: 'Tanggal selesai wajib diisi',
                  validate: val => !tanggalMulai || val >= tanggalMulai || 'Tanggal selesai tidak boleh sebelum tanggal mulai'
                })}
                className={`form-input ${errors.tanggal_selesai ? 'border-red-400' : ''}`}
                min={tanggalMulai}
              />
              {errors.tanggal_selesai && <p className="text-xs text-red-600 mt-1">{errors.tanggal_selesai.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="form-label">Pelaksana Kegiatan <span className="text-red-500">*</span></label>
              <input
                type="text"
                {...register('pelaksana_kegiatan', { required: 'Pelaksana kegiatan wajib diisi' })}
                className={`form-input ${errors.pelaksana_kegiatan ? 'border-red-400' : ''}`}
                placeholder="Masukkan nama pelaksana kegiatan"
              />
              {errors.pelaksana_kegiatan && <p className="text-xs text-red-600 mt-1">{errors.pelaksana_kegiatan.message}</p>}
            </div>
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
        title="Hapus Data Perjalanan Dinas"
        message={`Apakah Anda yakin ingin menghapus data perjalanan dinas "${deleteRow?.nama_kegiatan}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
