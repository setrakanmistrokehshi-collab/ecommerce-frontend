// src/pages/admin/AddProduct.jsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, uploadProductImage, getProductById } from '../../api/adminApi';
import { useToast } from '../../hooks/ToastContext';
import useFetch from '../../hooks/useFetch';

const EMPTY = {
  name: '', shortDescription: '', description: '',
  ingredients: '', benefits: '', howToUse: '',
  price: '', originalPrice: '', stock: '', servings: '',
  category: 'immunity', badge: '', tags: '',
  nafdac: '', isFeatured: false, isActive: true,
};

export default function AddProduct() {
  const { id }   = useParams();       // present when editing
  const isEdit   = Boolean(id);
  const navigate = useNavigate();
  const toast    = useToast();

  const [form,     setForm]     = useState(EMPTY);
  const [files,    setFiles]    = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [drag,     setDrag]     = useState(false);

  // Load existing product when editing
  useFetch(
    () => isEdit ? getProductById(id) : Promise.resolve(null),
    [id],
  );

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleFiles(fileList) {
    const arr = Array.from(fileList).slice(0, 5);
    setFiles(arr);
    setPreviews(arr.map(f => URL.createObjectURL(f)));
  }

  async function handleSubmit(status = 'active') {
    if (!form.name || !form.price || !form.stock) {
      toast('Name, price and stock are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price:         Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stock:         Number(form.stock),
        servings:      Number(form.servings),
        ingredients:   form.ingredients.split(',').map(s => s.trim()).filter(Boolean),
        benefits:      form.benefits.split(',').map(s => s.trim()).filter(Boolean),
        tags:          form.tags.split(',').map(s => s.trim()).filter(Boolean),
        isActive:      status === 'active',
      };

      let saved;
      if (isEdit) {
        saved = await updateProduct(id, payload);
        toast('Product updated ✅');
      } else {
        saved = await createProduct(payload);
        toast('Product created ✅');
      }

      // Upload images if any were selected
      if (files.length && saved?.data?._id) {
        const fd = new FormData();
        files.forEach(f => fd.append('images', f));
        await uploadProductImage(saved.data._id, fd);
      }

      navigate('/admin/products');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Edit Product' : 'Add Product'}</h1>
          <p>{isEdit ? `Editing product #${id}` : 'Create a new product listing'}</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/admin/products')}>← Back</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* LEFT — main info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Product Information</div>
            <Field label="Product Name *"              value={form.name}             onChange={v => set('name', v)}             placeholder="e.g. Greens Plus Daily Formula"/>
            <Field label="Short Description *"         value={form.shortDescription} onChange={v => set('shortDescription', v)} placeholder="One-line summary shown in listings"/>
            <div className="form-field">
              <label>Full Description</label>
              <textarea rows={4} placeholder="Detailed product description…" value={form.description} onChange={e => set('description', e.target.value)}/>
            </div>
            <Field label="Ingredients (comma separated)"  value={form.ingredients} onChange={v => set('ingredients', v)} placeholder="Spirulina, Chlorella, Ashwagandha"/>
            <Field label="Benefits (comma separated)"     value={form.benefits}    onChange={v => set('benefits', v)}    placeholder="Boosts immunity, Improves gut health"/>
            <Field label="How To Use"                     value={form.howToUse}    onChange={v => set('howToUse', v)}    placeholder="Mix 1 scoop with 250ml water daily"/>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Pricing & Stock</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Price (₦) *"          value={form.price}         onChange={v => set('price', v)}         type="number" placeholder="15000"/>
              <Field label="Original Price (₦)"   value={form.originalPrice} onChange={v => set('originalPrice', v)} type="number" placeholder="19500"/>
              <Field label="Stock Quantity *"      value={form.stock}         onChange={v => set('stock', v)}         type="number" placeholder="150"/>
              <Field label="Servings Per Pack"     value={form.servings}      onChange={v => set('servings', v)}      type="number" placeholder="30"/>
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Tags & Compliance</div>
            <Field label="Tags (comma separated)" value={form.tags}   onChange={v => set('tags', v)}   placeholder="greens, immunity, superfoods"/>
            <Field label="NAFDAC Number"          value={form.nafdac} onChange={v => set('nafdac', v)} placeholder="NAFDAC/FD-235"/>
          </div>
        </div>

        {/* RIGHT — image, category, publish */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Image upload */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Product Images</div>
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => document.getElementById('file-input').click()}
              style={{
                border: `2px dashed ${drag ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 10, padding: '28px 20px', textAlign: 'center',
                cursor: 'pointer', transition: 'border-color .15s',
                background: drag ? 'rgba(0,200,150,.04)' : 'transparent',
              }}
            >
              {previews.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {previews.map((src, i) => (
                    <img key={i} src={src} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}/>
                  ))}
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Drop images here or click</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>JPEG, PNG, WebP · Max 5MB · Up to 5 images</div>
                </>
              )}
            </div>
            <input
              id="file-input" type="file" multiple accept="image/*"
              style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)}
            />
            {previews.length > 0 && (
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8, fontSize: 12 }}
                onClick={e => { e.stopPropagation(); setFiles([]); setPreviews([]); }}>
                Clear images
              </button>
            )}
          </div>

          {/* Category */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Category & Badge</div>
            <div className="form-field">
              <label>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {['immunity','vitamins','beauty','energy','weight'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Badge</label>
              <select value={form.badge} onChange={e => set('badge', e.target.value)}>
                <option value="">None</option>
                {['Best Seller','New','Sale','Top Rated'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              <Toggle label="Featured product"          checked={form.isFeatured} onChange={v => set('isFeatured', v)}/>
              <Toggle label="Active / visible in store" checked={form.isActive}   onChange={v => set('isActive', v)}/>
            </div>
          </div>

          {/* Publish */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 14 }}
            onClick={() => handleSubmit('active')}
            disabled={saving}
          >
            {saving ? 'Saving…' : isEdit ? '✅ Save Changes' : '✅ Publish Product'}
          </button>
          <button
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => handleSubmit('draft')}
            disabled={saving}
          >
            Save as Draft
          </button>
        </div>
      </div>
    </>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20,
          background: checked ? 'var(--accent)' : 'var(--surface2)',
          border: '1px solid var(--border)', borderRadius: 20,
          position: 'relative', transition: 'background .2s', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 2, left: checked ? 18 : 2,
          width: 14, height: 14, background: '#fff', borderRadius: '50%',
          transition: 'left .2s',
        }}/>
      </div>
      {label}
    </label>
  );
}
