import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Upload, 
  Calendar, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  X,
  Layers
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  increment 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';

// Official SLIMFAST Catalog specs for 1-click initial seed helper
export const OFFICIAL_SLIMFAST_CATALOG = [
  {
    name: "SLIMFAST Best Slimming Tea (Jar)",
    category: "Slimming Tea",
    priceTZS: 45000,
    stock: 50,
    lowStockThreshold: 10,
    batchNumber: "SF-TEA-2024-01",
    expiryDate: "FEB 2027",
    netWeight: "150g Jar",
    ingredients: "Moringa oleifera, Black Pepper, Great Basil, Garcinia Cambogia, Fennel",
    directions: "1 teaspoon in boiling water, steep 4 minutes, 1 cup daily before bed.",
    benefits: "Visceral fat burn, Digestive detox, Anti-bloating, Metabolism boost, Blood sugar support",
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "SLIMFAST Bean Powder for Weight Loss (250g Pouch)",
    category: "Bean Powder",
    priceTZS: 55000,
    stock: 40,
    lowStockThreshold: 8,
    batchNumber: "SF-BP-2024-02",
    expiryDate: "FEB 2027",
    netWeight: "250g Pouch",
    ingredients: "Unroasted Arabica AAA Decaffeinated Beans, Green Tea Extracts, Dandelion Purifying Herbs",
    directions: "1 coffee spoon in boiling water every morning before or during breakfast.",
    benefits: "Natural appetite suppression, Accelerated thermogenesis, Cholesterol balance, Clean all-day vitality",
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80"
  }
];

export const BmsProducts = ({ isReadOnly = false }) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { isOwner, userProfile, currentUser } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [restockModalProduct, setRestockModalProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Slimming Tea',
    priceTZS: '',
    stock: 20,
    lowStockThreshold: 5,
    batchNumber: 'SF-BATCH-01',
    expiryDate: 'FEB 2027',
    netWeight: '',
    ingredients: '',
    directions: '',
    benefits: '',
    imageUrl: ''
  });

  const [restockData, setRestockData] = useState({
    unitsToAdd: 10,
    newBatchNumber: '',
    newExpiry: 'FEB 2027'
  });

  // Image Upload state
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setProducts(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Slimming Tea',
      priceTZS: '',
      stock: 20,
      lowStockThreshold: 5,
      batchNumber: 'SF-BATCH-' + Math.floor(100 + Math.random() * 900),
      expiryDate: 'FEB 2027',
      netWeight: '',
      ingredients: '',
      directions: '',
      benefits: '',
      imageUrl: ''
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      category: p.category || 'Slimming Tea',
      priceTZS: p.priceTZS || p.price || '',
      stock: p.stock ?? 0,
      lowStockThreshold: p.lowStockThreshold || 5,
      batchNumber: p.batchNumber || '',
      expiryDate: p.expiryDate || 'FEB 2027',
      netWeight: p.netWeight || '',
      ingredients: p.ingredients || '',
      directions: p.directions || '',
      benefits: Array.isArray(p.benefits) ? p.benefits.join(', ') : (p.benefits || ''),
      imageUrl: p.imageUrl || ''
    });
    setImageFile(null);
    setModalOpen(true);
  };

  // Upload image to Firebase Storage
  const handleImageUpload = async (file) => {
    if (!storage || !file) return null;
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      setUploading(true);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Storage upload error:', error);
          setUploading(false);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          resolve(downloadUrl);
        }
      );
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!isOwner) return;
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let finalImageUrl = formData.imageUrl;
      if (imageFile) {
        finalImageUrl = await handleImageUpload(imageFile);
      }

      const productPayload = {
        name: formData.name,
        category: formData.category,
        priceTZS: Number(formData.priceTZS),
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        batchNumber: formData.batchNumber,
        expiryDate: formData.expiryDate,
        netWeight: formData.netWeight,
        ingredients: formData.ingredients,
        directions: formData.directions,
        benefits: formData.benefits,
        imageUrl: finalImageUrl || '/leaf.svg',
        updatedAt: new Date().toISOString()
      };

      if (editingProduct && db) {
        await updateDoc(doc(db, 'products', editingProduct.id), productPayload);
        setSuccessMessage('Product updated successfully!');
      } else if (db) {
        await addDoc(collection(db, 'products'), {
          ...productPayload,
          createdAt: new Date().toISOString()
        });
        setSuccessMessage('Product added to catalog!');
      }

      setModalOpen(false);
    } catch (err) {
      console.error('Save product error:', err);
      setErrorMessage(err.message || 'Error saving product.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!isOwner) return;
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      alert('Could not delete product: ' + err.message);
    }
  };

  // Restock batch
  const handleRestockBatch = async (e) => {
    e.preventDefault();
    if (!restockModalProduct || !db) return;
    try {
      await updateDoc(doc(db, 'products', restockModalProduct.id), {
        stock: increment(Number(restockData.unitsToAdd)),
        batchNumber: restockData.newBatchNumber || restockModalProduct.batchNumber,
        expiryDate: restockData.newExpiry || restockModalProduct.expiryDate,
        lastRestockedAt: new Date().toISOString()
      });

      // Audit log
      await addDoc(collection(db, 'audit_logs'), {
        action: `Restocked ${restockData.unitsToAdd} units of ${restockModalProduct.name} (Batch: ${restockData.newBatchNumber || 'Same'})`,
        performedBy: userProfile?.name || currentUser?.email || 'Owner',
        timestamp: new Date().toISOString()
      });

      setRestockModalProduct(null);
    } catch (err) {
      alert('Restock failed: ' + err.message);
    }
  };

  // Quick Seed Handler for the Owner
  const handleSeedCatalog = async () => {
    if (!isOwner || !db) return;
    if (!window.confirm('Initialize official SLIMFAST products (Slimming Tea & Bean Powder) into Firestore?')) return;
    try {
      for (const item of OFFICIAL_SLIMFAST_CATALOG) {
        await addDoc(collection(db, 'products'), {
          ...item,
          createdAt: new Date().toISOString()
        });
      }
      alert('Official SLIMFAST products loaded into Firestore!');
    } catch (err) {
      alert('Could not seed catalog: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-serif text-brand-forest">
            {t('bms.inventory.title')}
          </h2>
          <p className="text-xs text-brand-charcoal/70 mt-1">
            {t('bms.inventory.subtitle')}
          </p>
        </div>

        {isOwner && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSeedCatalog}
              className="px-3.5 py-2.5 rounded-xl border border-brand-leaf/40 bg-brand-surface hover:bg-brand-leaf/20 text-brand-forest font-bold text-xs flex items-center space-x-1.5 transition-colors"
              title="Add official SLIMFAST products"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-leaf" />
              <span>{t('bms.inventory.seedBtn')}</span>
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t('bms.inventory.addProduct')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Product List / Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-brand-leaf/30 border-t-brand-forest rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-brand-muted mt-2">{t('loading')}</p>
        </div>
      ) : products.length === 0 ? (
        
        /* Clean Empty Catalog State */
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-brand-leaf/30 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-surface flex items-center justify-center text-brand-muted">
            <Package className="w-8 h-8 text-brand-leaf" />
          </div>
          <h3 className="text-lg font-bold font-serif text-brand-forest">
            {t('products.emptyTitle')}
          </h3>
          <p className="text-xs text-brand-charcoal/70 max-w-md mx-auto leading-relaxed">
            {t('bms.inventory.emptyCatalog')}
          </p>
          {isOwner && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSeedCatalog}
                className="px-5 py-3 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white font-bold text-xs shadow-md transition-all inline-flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('bms.inventory.seedBtn')}</span>
              </button>
            </div>
          )}
        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => {
            const isOutOfStock = (p.stock ?? 0) <= 0;
            const isLowStock = !isOutOfStock && (p.stock ?? 0) <= (p.lowStockThreshold || 10);
            return (
              <div 
                key={p.id} 
                className="bg-white rounded-3xl p-5 border border-brand-leaf/25 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-leaf bg-brand-surface px-2.5 py-0.5 rounded-full border border-brand-leaf/20">
                      {p.category || 'Herbal'}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      isOutOfStock ? 'bg-red-100 text-red-700' : isLowStock ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      Stock: {p.stock ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 shrink-0 bg-brand-surface rounded-xl p-1.5 flex items-center justify-center border border-brand-leaf/20">
                      <img 
                        src={p.imageUrl || '/leaf.svg'} 
                        alt={p.name} 
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/leaf.svg';
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-serif text-brand-forest line-clamp-1">
                        {p.name}
                      </h4>
                      <p className="text-xs font-black text-brand-leaf mt-0.5">
                        {formatPrice(p.priceTZS || p.price)}
                      </p>
                      <p className="text-[10px] text-brand-muted mt-0.5">
                        Batch: {p.batchNumber || 'N/A'} • Exp: {p.expiryDate || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {p.ingredients && (
                    <div className="text-[11px] text-brand-charcoal/80 bg-brand-surface/50 p-2.5 rounded-xl border border-brand-leaf/15 line-clamp-2">
                      <strong>Botanicals:</strong> {p.ingredients}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-brand-leaf/15 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRestockModalProduct(p);
                      setRestockData({
                        unitsToAdd: 10,
                        newBatchNumber: p.batchNumber || '',
                        newExpiry: p.expiryDate || 'FEB 2027'
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-leaf/20 text-brand-forest font-bold text-xs border border-brand-leaf/30 transition-colors"
                  >
                    {t('bms.inventory.restockBatch')}
                  </button>

                  {isOwner && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg text-brand-charcoal hover:bg-brand-surface transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg text-brand-muted hover:text-red-600 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-brand-leaf/30 p-6 sm:p-8 space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-brand-surface text-brand-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-serif text-brand-forest">
              {editingProduct ? t('bms.inventory.editProduct') : t('bms.inventory.addProduct')}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('bms.inventory.productName')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SLIMFAST Best Slimming Tea (Jar)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs focus:ring-2 focus:ring-brand-forest bg-brand-surface/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    {t('bms.inventory.category')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Slimming Tea"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs focus:ring-2 focus:ring-brand-forest bg-brand-surface/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    {t('bms.inventory.priceTZS')} *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45000"
                    value={formData.priceTZS}
                    onChange={(e) => setFormData({ ...formData, priceTZS: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs focus:ring-2 focus:ring-brand-forest bg-brand-surface/40 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    {t('bms.inventory.currentStock')} *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs focus:ring-2 focus:ring-brand-forest bg-brand-surface/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    {t('bms.inventory.lowStockThreshold')}
                  </label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs focus:ring-2 focus:ring-brand-forest bg-brand-surface/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    {t('bms.inventory.batchNumber')}
                  </label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs focus:ring-2 focus:ring-brand-forest bg-brand-surface/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    {t('bms.inventory.expiryDate')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FEB 2027"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs focus:ring-2 focus:ring-brand-forest bg-brand-surface/40 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('bms.inventory.ingredients')}
                </label>
                <textarea
                  rows="2"
                  placeholder="Moringa oleifera, Black Pepper, Great Basil, Garcinia Cambogia, Fennel"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-leaf/30 text-xs focus:ring-2 focus:ring-brand-forest bg-brand-surface/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('bms.inventory.directions')}
                </label>
                <textarea
                  rows="2"
                  placeholder="1 teaspoon in boiling water, steep 4 minutes, 1 cup daily."
                  value={formData.directions}
                  onChange={(e) => setFormData({ ...formData, directions: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-leaf/30 text-xs focus:ring-2 focus:ring-brand-forest bg-brand-surface/40"
                />
              </div>

              {/* Product Image (Firebase Storage Upload & URL Fallback) */}
              <div className="space-y-2 p-3 bg-brand-surface rounded-xl border border-brand-leaf/25">
                <label className="block text-xs font-bold text-brand-forest">
                  {t('bms.inventory.imageSource')}
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="text-xs text-brand-charcoal file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-forest file:text-white hover:file:bg-brand-leaf"
                  />
                  <span className="text-[10px] text-brand-muted">or URL below</span>
                </div>
                <input
                  type="url"
                  placeholder="https://... direct image link"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-brand-leaf/30 text-xs bg-white"
                />
                {uploading && (
                  <div className="text-[10px] text-brand-forest font-bold">
                    Uploading image to Firebase Storage: {uploadProgress}%
                  </div>
                )}
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-brand-leaf/30 text-xs font-bold text-brand-charcoal"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white text-xs font-bold shadow-md"
                >
                  {t('bms.inventory.saveProduct')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Batch Modal */}
      {restockModalProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-brand-leaf/30 p-6 space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setRestockModalProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-brand-surface text-brand-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold font-serif text-brand-forest">
              {t('bms.inventory.restockTitle')}: {restockModalProduct.name}
            </h3>

            <form onSubmit={handleRestockBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('bms.inventory.unitsToAdd')} *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockData.unitsToAdd}
                  onChange={(e) => setRestockData({ ...restockData, unitsToAdd: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs font-bold bg-brand-surface/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('bms.inventory.newBatchNumber')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. SF-BATCH-2025"
                  value={restockData.newBatchNumber}
                  onChange={(e) => setRestockData({ ...restockData, newBatchNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs bg-brand-surface/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('bms.inventory.newExpiry')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. FEB 2027"
                  value={restockData.newExpiry}
                  onChange={(e) => setRestockData({ ...restockData, newExpiry: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs bg-brand-surface/40 font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRestockModalProduct(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-brand-charcoal"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white text-xs font-bold shadow-md"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
