// --- PENTING: Saldo Awal NOL dan Riwayat Kosong ---
const SALDO_DEFAULT = 0;
const RIWAYAT_DEFAULT = []; // Riwayat default kosong

let saldo = SALDO_DEFAULT;
let riwayatTransaksi = [];

// Elemen DOM Aplikasi
const totalSaldoEl = document.getElementById('total-saldo');
const daftarRiwayatEl = document.getElementById('daftar-riwayat');
const formTransaksiEl = document.getElementById('form-transaksi');
const jenisTransaksiInput = document.getElementById('jenis-transaksi');
const tanggalInput = document.getElementById('tanggal');
const deskripsiInput = document.getElementById('deskripsi');
const btnMulai = document.getElementById('btn-mulai');
const btnReset = document.getElementById('btn-reset'); 
const halamanAwal = document.getElementById('halaman-awal');
const halamanUtama = document.getElementById('halaman-utama');
const jumlahInput = document.getElementById('jumlah');

// Elemen Baru: Input Group Deskripsi
const deskripsiInputGroup = document.getElementById('deskripsi-input-group');

// Elemen DOM Modal Kustom (Mengganti alert/confirm)
const customModalEl = document.getElementById('custom-modal');
const modalMessageEl = document.getElementById('modal-message');
const modalActionsEl = document.getElementById('modal-actions');


// --- FUNGSI MODAL KUSTOM ---

/**
 * Menampilkan modal konfirmasi atau notifikasi non-blokir.
 * @param {string} message - Pesan yang akan ditampilkan.
 * @param {boolean} isConfirmation - Jika true, tampilkan tombol Ya/Batal. Jika false, tampilkan hanya tombol OK (untuk notifikasi).
 * @returns {Promise<boolean>} Resolves true for 'Ya'/'OK', false for 'Batal'.
 */
const showCustomModal = (message, isConfirmation = false) => {
    return new Promise(resolve => {
        // Set pesan
        modalMessageEl.textContent = message;

        // Atur tombol aksi
        if (isConfirmation) {
            modalActionsEl.innerHTML = `
                <button id="modal-confirm-temp" class="btn-modal btn-confirm">Ya, Hapus</button>
                <button id="modal-cancel-temp" class="btn-modal btn-cancel">Batal</button>
            `;
            const confirmBtn = document.getElementById('modal-confirm-temp');
            const cancelBtn = document.getElementById('modal-cancel-temp');

            confirmBtn.onclick = () => {
                customModalEl.classList.add('tersembunyi');
                resolve(true);
            };
            cancelBtn.onclick = () => {
                customModalEl.classList.add('tersembunyi');
                resolve(false);
            };

        } else {
            // Mode Notifikasi (Hanya tombol OK)
            modalActionsEl.innerHTML = `
                <button id="modal-ok-temp" class="btn-modal btn-confirm">OK</button>
            `;
            const okBtn = document.getElementById('modal-ok-temp');
            okBtn.onclick = () => {
                customModalEl.classList.add('tersembunyi');
                resolve(true); // Resolve true setelah OK
            };
        }

        // Tampilkan modal
        customModalEl.classList.remove('tersembunyi');
    });
};

// --- FUNGSI BARU UNTUK INPUT DINAMIS ---
const toggleDescriptionInput = (jenis) => {
    if (jenis === 'pemasukan') {
        // Sembunyikan input group
        deskripsiInputGroup.classList.add('tersembunyi');
        // Hapus atribut required
        deskripsiInput.removeAttribute('required');
        // Kosongkan nilainya
        deskripsiInput.value = ''; 
    } else {
        // Tampilkan input group
        deskripsiInputGroup.classList.remove('tersembunyi');
        // Tambahkan kembali atribut required
        deskripsiInput.setAttribute('required', 'required');
    }
}


// --- FUNGSI UTAMA ---

// 1. Inisialisasi Data dari Local Storage
const initApp = () => {
    // Ambil Saldo
    const storedSaldo = localStorage.getItem('saldo');
    if (storedSaldo !== null) {
        saldo = parseInt(storedSaldo); 
    } else {
        saldo = SALDO_DEFAULT; 
    }

    // Ambil Riwayat
    const storedRiwayat = localStorage.getItem('riwayatTransaksi');
    if (storedRiwayat) {
        riwayatTransaksi = JSON.parse(storedRiwayat); 
    } else {
        riwayatTransaksi = RIWAYAT_DEFAULT; 
    }

    // Set tanggal default dan inisialisasi tampilan form
    tanggalInput.value = new Date().toISOString().split('T')[0];
    toggleDescriptionInput(jenisTransaksiInput.value); // Inisialisasi status form
    
    updateSaldo();
    tampilkanRiwayat(); 
};

// 2. Fungsi untuk format angka ke Rupiah
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
};

// 3. Fungsi untuk format tanggal (yyyy-mm-dd menjadi dd/mm)
const formatTanggal = (tanggalString) => {
    const [year, month, day] = tanggalString.split('-');
    return `${day}/${month}`;
}

// 4. Fungsi untuk mengupdate tampilan saldo dan menyimpan ke Local Storage
const updateSaldo = () => {
    totalSaldoEl.textContent = formatRupiah(saldo);
    localStorage.setItem('saldo', saldo);
};

// 5. Fungsi Ikon 
const getIcon = (deskripsi, jenis) => {
    deskripsi = deskripsi.toLowerCase();
    if (jenis === 'pemasukan') {
        return 'fas fa-piggy-bank'; // Ikon celengan untuk tabungan
    } else {
        if (deskripsi.includes('kopi')) return 'fas fa-utensils';
        return 'fas fa-minus';
    }
};

// 6. Fungsi untuk menampilkan riwayat transaksi
const tampilkanRiwayat = () => {
    daftarRiwayatEl.innerHTML = ''; 
    
    if (riwayatTransaksi.length === 0) {
        daftarRiwayatEl.innerHTML = '<li style="text-align: center; color: var(--color-secondary-text); font-style: italic;">Belum ada riwayat transaksi.</li>';
        localStorage.removeItem('riwayatTransaksi'); 
        return;
    }
    
    riwayatTransaksi
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)) 
        .forEach(transaksi => {
        const li = document.createElement('li');
        const tanda = transaksi.jenis === 'pemasukan' ? '+' : '-';
        const ikon = getIcon(transaksi.deskripsi, transaksi.jenis);

        li.classList.add('transaksi', transaksi.jenis);
        li.innerHTML = `
            <div class="tanggal-wrap">${formatTanggal(transaksi.tanggal)}</div>
            <div class="ikon-wrap"><i class="${ikon}"></i></div>
            <div class="deskripsi-wrap">${transaksi.deskripsi}</div>
            <div class="jumlah-wrap">${tanda} ${formatRupiah(transaksi.jumlah).replace('Rp', '')}</div>
        `;
        daftarRiwayatEl.appendChild(li); 
    });
    
    localStorage.setItem('riwayatTransaksi', JSON.stringify(riwayatTransaksi));
};


// --- HANDLER EVENT ---

// 1. Handler untuk submit form transaksi (Perubahan Logika Deskripsi)
const handleFormSubmit = async (e) => {
    e.preventDefault();

    const jumlah = parseInt(jumlahInput.value);
    const jenis = jenisTransaksiInput.value;
    const tanggal = tanggalInput.value;
    let deskripsi = deskripsiInput.value.trim(); // Ambil nilai deskripsi
    
    if (!tanggal || jumlah <= 0 || isNaN(jumlah)) {
        await showCustomModal('Tanggal dan Jumlah harus diisi dengan benar.', false);
        return;
    }
    
    // Logika Khusus Deskripsi
    if (jenis === 'pemasukan') {
        // Untuk Pemasukan, deskripsi diisi otomatis dan tidak perlu dicek
        deskripsi = 'Setoran Tabungan'; 
    } else {
        // Untuk Pengeluaran, cek apakah deskripsi diisi
        if (!deskripsi) {
            await showCustomModal('Deskripsi pengeluaran harus diisi!', false);
            return;
        }
    }

    const transaksiBaru = {
        deskripsi,
        jumlah,
        jenis,
        tanggal
    };

    // Update saldo
    saldo = jenis === 'pemasukan' ? saldo + jumlah : saldo - jumlah;

    // Tambahkan ke riwayat
    riwayatTransaksi.push(transaksiBaru);
    
    // Update tampilan dan reset form
    updateSaldo();
    tampilkanRiwayat(); 
    deskripsiInput.value = '';
    jumlahInput.value = '';
    
    // Kembalikan ke pilihan pemasukan default setelah submit
    document.querySelectorAll('.radio-group .radio-label').forEach(label => {
        label.classList.remove('active');
        if (label.dataset.type === 'pemasukan') {
            label.classList.add('active');
        }
    });
    jenisTransaksiInput.value = 'pemasukan';
    toggleDescriptionInput('pemasukan'); // Panggil agar form kembali ke mode Pemasukan
};

// 2. Handler untuk tombol Reset TOTAL DATA (FIXED)
const handleReset = () => {
    if (confirm('APAKAH ANDA YAKIN? Ini akan menghapus SEMUA DATA Anda (Saldo Rp 0 dan Riwayat hilang total).')) {

        // Hapus data
        localStorage.removeItem('saldo');
        localStorage.removeItem('riwayatTransaksi');

        // Reset variabel
        saldo = SALDO_DEFAULT;
        riwayatTransaksi = RIWAYAT_DEFAULT;

        // Refresh otomatis
        location.reload();
    }
};

// 3. Handler untuk memilih jenis transaksi (Memanggil fungsi toggle input)
const handleRadioClick = (e) => {
    const targetLabel = e.target.closest('.radio-label');
    if (!targetLabel) return;
    
    document.querySelectorAll('.radio-group .radio-label').forEach(label => label.classList.remove('active'));
    targetLabel.classList.add('active');
    
    const newJenis = targetLabel.dataset.type;
    jenisTransaksiInput.value = newJenis;
    
    // Panggil fungsi toggle untuk menyembunyikan/menampilkan deskripsi
    toggleDescriptionInput(newJenis);
};


// --- INITIAL CALLS & EVENT LISTENERS ---
formTransaksiEl.addEventListener('submit', handleFormSubmit);
document.querySelectorAll('.radio-group').forEach(group => {
    group.addEventListener('click', handleRadioClick);
});
btnMulai.addEventListener('click', () => {
    halamanAwal.classList.add('tersembunyi');
    halamanUtama.classList.remove('tersembunyi');
});
btnReset.addEventListener('click', handleReset); 

// Inisialisasi aplikasi saat halaman dimuat
initApp();
