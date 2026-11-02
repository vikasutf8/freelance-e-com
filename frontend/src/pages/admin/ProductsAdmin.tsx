import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  Boxes,
  Gauge,
  ImageOff,
  ImagePlus,
  LoaderCircle,
  Package,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  SearchX,
  Trash2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from '../../api/products';
import { getApiError, getApiErrorMessage } from '../../api/errors';
import { AdminPageHeader, AdminStat, ConfirmDialog } from '../../components/AdminUI';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { ProductImage } from '../../components/ProductImage';
import { useToast } from '../../context/ToastContext';
import type { Product, ProductPayload } from '../../types';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/format';
import {
  prepareProductImage,
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_MAX_DIMENSION,
} from '../../utils/imageUpload';

const PRODUCT_LIMIT = 100;

const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Product name is required')
    .max(255, 'Keep the name under 255 characters'),
  price: z
    .string()
    .trim()
    .min(1, 'Price is required')
    .refine(
      (value) =>
        /^\d+(\.\d{1,2})?$/.test(value) &&
        Number(value) > 0 &&
        Number(value) <= 99999999.99,
      'Enter a price above 0 with up to 2 decimals',
    ),
  stock: z
    .string()
    .trim()
    .min(1, 'Stock is required')
    .refine((value) => /^\d+$/.test(value), 'Use a whole number of 0 or more'),
  description: z
    .string()
    .max(5000, 'Keep the description under 5000 characters'),
});

type ProductFormValues = z.infer<typeof productSchema>;

function stockBadge(stock: number) {
  if (stock === 0)
    return {
      label: 'Out of stock',
      className: 'bg-[#F5E9E4] text-[#9B6049]',
    };
  if (stock <= 5)
    return {
      label: 'Low stock',
      className: 'bg-[#F5EFE2] text-[#8B7045]',
    };
  return {
    label: 'In stock',
    className: 'bg-calm-mist text-calm-sage',
  };
}

export function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageAction, setImageAction] = useState<'keep' | 'replace' | 'remove'>(
    'keep',
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', price: '', stock: '', description: '' },
  });

  const watchedName = watch('name');
  const previewImageUrl =
    imageAction === 'remove'
      ? null
      : imageData ?? editingProduct?.imageUrl ?? null;

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listProducts(1, 100);
      setProducts(response.data);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) ||
        String(product.id) === normalized ||
        (product.description ?? '').toLowerCase().includes(normalized),
    );
  }, [products, query]);

  const lowStockCount = products.filter(
    (product) => product.stock > 0 && product.stock <= 5,
  ).length;
  const outOfStockCount = products.filter((product) => product.stock === 0).length;
  const atLimit = products.length >= PRODUCT_LIMIT;
  const capacity = Math.min(100, (products.length / PRODUCT_LIMIT) * 100);

  const resetImageState = () => {
    setImageData(null);
    setImageAction('keep');
    setImageError(null);
    setIsPreparingImage(false);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const openCreate = () => {
    if (atLimit) return;
    setEditingProduct(null);
    setFormError(null);
    resetImageState();
    reset({ name: '', price: '', stock: '', description: '' });
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormError(null);
    resetImageState();
    reset({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      description: product.description ?? '',
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    if (isSubmitting || isPreparingImage) return;
    setFormOpen(false);
    setEditingProduct(null);
    setFormError(null);
    resetImageState();
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsPreparingImage(true);
    setImageError(null);
    try {
      const prepared = await prepareProductImage(file);
      setImageData(prepared);
      setImageAction('replace');
    } catch (prepareError) {
      setImageError(
        prepareError instanceof Error
          ? prepareError.message
          : 'Could not prepare that image.',
      );
    } finally {
      setIsPreparingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageData(null);
    setImageError(null);
    setImageAction(editingProduct ? 'remove' : 'keep');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const onSubmit = async (values: ProductFormValues) => {
    setFormError(null);
    const payload: ProductPayload = {
      name: values.name.trim(),
      price: Number(values.price),
      stock: Number(values.stock),
      description: values.description.trim() || null,
    };

    if (imageAction === 'replace' && imageData) {
      payload.image = imageData;
    } else if (imageAction === 'remove') {
      payload.image = null;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        addToast({
          title: 'Product updated',
          message: `${payload.name} is looking fresh.`,
          tone: 'success',
        });
      } else {
        await createProduct(payload);
        addToast({
          title: 'Product added',
          message: `${payload.name} is now part of the collection.`,
          tone: 'success',
        });
      }
      setFormOpen(false);
      setEditingProduct(null);
      resetImageState();
      await loadProducts();
    } catch (submitError) {
      const apiError = getApiError(submitError);
      if (apiError?.statusCode === 409) {
        setFormError(
          'The 100-product limit has been reached. Delete a product before adding another.',
        );
      } else {
        setFormError(getApiErrorMessage(submitError));
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      addToast({
        title: 'Product removed',
        message: `${deleteTarget.name} has been taken off the shelf.`,
        tone: 'success',
      });
      setDeleteTarget(null);
      await loadProducts();
    } catch (deleteError) {
      addToast({
        title: 'Could not delete product',
        message: getApiErrorMessage(deleteError),
        tone: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        description="Curate the shelf, keep stock honest and make room for what comes next."
        action={
          <div>
            <button
              type="button"
              onClick={openCreate}
              disabled={atLimit}
              className="btn-calm w-full sm:w-auto"
            >
              <Plus size={15} />
              Add product
            </button>
            {atLimit ? (
              <p className="mt-2 text-center text-[9px] text-[#9B6049]">
                Product limit reached
              </p>
            ) : null}
          </div>
        }
      />

      <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <AdminStat
          icon={Package}
          label="Active"
          value={products.length}
          detail="Live products on the shelf"
          tone="sage"
        />
        <AdminStat
          icon={AlertTriangle}
          label="Low stock"
          value={lowStockCount}
          detail="Five units or fewer"
          tone="warning"
        />
        <AdminStat
          icon={Boxes}
          label="Sold out"
          value={outOfStockCount}
          detail="Needs a restock soon"
        />
        <AdminStat
          icon={Gauge}
          label="Capacity"
          value={`${products.length}/${PRODUCT_LIMIT}`}
          detail={`${Math.round(capacity)}% of catalog limit`}
          tone="sand"
        />
      </div>

      <section className="mt-4 rounded-card border border-white/60 bg-calm-ivory p-5 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-[8px] font-semibold uppercase tracking-[0.18em] text-calm-muted">
              Catalog capacity
            </p>
            <p className="mt-1 text-[11px] text-calm-body">
              {PRODUCT_LIMIT - products.length} slots remaining
            </p>
          </div>
          <p className="font-serif text-lg text-calm-ink">
            {Math.round(capacity)}%
          </p>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-calm-track">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              atLimit ? 'bg-[#A75B44]' : 'bg-calm-sage',
            )}
            style={{ width: `${capacity}%` }}
          />
        </div>
        {atLimit ? (
          <p className="mt-3 text-[10px] leading-5 text-[#9B6049]">
            Your store has reached its 100-product limit. Delete a product to
            open a slot.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-card border border-white/60 bg-calm-ivory shadow-card">
        <div className="flex flex-col gap-3 border-b border-calm-sand/35 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-[9px] font-semibold uppercase tracking-[0.16em] text-calm-ink">
              The shelf
            </p>
            <p className="mt-1 text-[10px] text-calm-muted">
              {filteredProducts.length} matching {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>
          <label className="flex h-10 w-full items-center gap-2 rounded-full border border-calm-sand/60 bg-white/75 px-4 sm:w-64">
            <Search size={14} className="shrink-0 text-calm-muted" />
            <span className="sr-only">Search products</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or ID"
              className="min-w-0 flex-1 bg-transparent text-xs text-calm-ink outline-none"
            />
          </label>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="skeleton h-12 w-12 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-1/3" />
                  <div className="skeleton h-2.5 w-1/5" />
                </div>
                <div className="skeleton h-3 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-5">
            <EmptyState
              calm
              icon={AlertTriangle}
              title="Could not load the catalog"
              message={error}
              action={
                <button type="button" onClick={() => void loadProducts()} className="btn-calm">
                  Try again
                </button>
              }
              className="border-0 bg-transparent py-10"
            />
          </div>
        ) : products.length === 0 ? (
          <div className="p-5">
            <EmptyState
              calm
              icon={PackageOpen}
              title="The shelf is empty"
              message="Add the first product and give your storefront something beautiful to show."
              action={
                <button type="button" onClick={openCreate} className="btn-calm">
                  <Plus size={15} />
                  Add your first product
                </button>
              }
              className="border-0 bg-transparent py-10"
            />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-5">
            <EmptyState
              calm
              icon={SearchX}
              title="No products match"
              message="Try a different name, description or product ID."
              action={
                <button type="button" onClick={() => setQuery('')} className="btn-calm-secondary">
                  Clear search
                </button>
              }
              className="border-0 bg-transparent py-10"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-calm-sand/35 text-[8px] uppercase tracking-[0.14em] text-calm-muted">
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-calm-sand/25">
                {filteredProducts.map((product) => {
                  const badge = stockBadge(product.stock);
                  return (
                    <tr key={product.id} className="transition hover:bg-white/45">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-calm-sand/40">
                            <ProductImage
                              name={product.name}
                              imageUrl={product.imageUrl}
                              decorative
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[260px] truncate text-xs font-medium text-calm-ink">
                              {product.name}
                            </p>
                            <p className="mt-0.5 max-w-[260px] truncate text-[9px] text-calm-muted">
                              {product.description || 'No description yet'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[10px] text-calm-muted">
                        #{String(product.id).padStart(3, '0')}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-calm-ink">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-calm-body">
                        {product.stock}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-1 font-display text-[7.5px] font-semibold uppercase tracking-[0.1em]',
                            badge.className,
                          )}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            aria-label={`Edit ${product.name}`}
                            className="grid h-8 w-8 place-items-center rounded-full text-calm-muted transition hover:bg-white hover:text-calm-ink"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            aria-label={`Delete ${product.name}`}
                            className="grid h-8 w-8 place-items-center rounded-full text-calm-muted transition hover:bg-[#F5E9E4] hover:text-[#9B6049]"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editingProduct ? 'Edit product' : 'Add a product'}
        description={
          editingProduct
            ? 'Update the details on your shelf. Changes are visible immediately.'
            : 'A small, considered addition to the collection. All fields can be refined later.'
        }
        size="lg"
        tone="calm"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-calm-sand/35 bg-calm-canvas/60 p-4 sm:flex-row sm:items-center">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-calm-sand/40 bg-calm-mist">
              <ProductImage
                name={watchedName || 'New ritual'}
                imageUrl={previewImageUrl}
                decorative
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[8px] font-semibold uppercase tracking-[0.16em] text-calm-muted">
                Product image
              </p>
              <p className="mt-1 text-xs leading-5 text-calm-body">
                PNG or JPEG. Automatically resized to fit{' '}
                {PRODUCT_IMAGE_MAX_DIMENSION} × {PRODUCT_IMAGE_MAX_DIMENSION} and
                kept under 2 MB.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isPreparingImage || isSubmitting}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-white px-4 text-[10px] font-medium text-calm-ink ring-1 ring-calm-sand/70 transition hover:ring-calm-sage disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPreparingImage ? (
                    <LoaderCircle size={13} className="animate-spin" />
                  ) : (
                    <ImagePlus size={13} />
                  )}
                  {isPreparingImage
                    ? 'Preparing'
                    : previewImageUrl
                      ? 'Replace image'
                      : 'Upload image'}
                </button>
                {previewImageUrl ? (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isPreparingImage || isSubmitting}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-full px-4 text-[10px] font-medium text-[#9B6049] transition hover:bg-[#F5E9E4] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ImageOff size={13} />
                    Remove
                  </button>
                ) : null}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept={PRODUCT_IMAGE_ACCEPT}
                onChange={(event) => void handleImageChange(event)}
                aria-label="Upload product image"
                className="sr-only"
              />
              {imageError ? (
                <p role="alert" className="mt-2 text-[10px] text-[#A15842]">
                  {imageError}
                </p>
              ) : (
                <p className="mt-2 text-[9px] text-calm-muted">
                  {previewImageUrl
                    ? 'Uploaded image will be used across the storefront.'
                    : 'Without an image, Purelis artwork is generated from the name.'}
                </p>
              )}
            </div>
          </div>

          {formError ? (
            <div
              role="alert"
              className="mb-5 rounded-2xl border border-[#B8674F]/20 bg-[#F7EDE8] px-4 py-3 text-xs leading-5 text-[#8D4D38]"
            >
              {formError}
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label htmlFor="product-name" className="label-calm">
                Product name
              </label>
              <input
                id="product-name"
                type="text"
                placeholder="Calming Green Tea Face Wash"
                className={cn('input-calm', errors.name && 'border-[#B8674F]/55')}
                {...register('name')}
              />
              {errors.name ? (
                <p className="mt-1.5 text-[11px] text-[#A15842]">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="product-price" className="label-calm">
                  Price (₹)
                </label>
                <input
                  id="product-price"
                  type="number"
                  min="0.01"
                  max="99999999.99"
                  step="0.01"
                  placeholder="499"
                  className={cn('input-calm', errors.price && 'border-[#B8674F]/55')}
                  {...register('price')}
                />
                {errors.price ? (
                  <p className="mt-1.5 text-[11px] text-[#A15842]">{errors.price.message}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="product-stock" className="label-calm">
                  Stock
                </label>
                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="25"
                  className={cn('input-calm', errors.stock && 'border-[#B8674F]/55')}
                  {...register('stock')}
                />
                {errors.stock ? (
                  <p className="mt-1.5 text-[11px] text-[#A15842]">{errors.stock.message}</p>
                ) : null}
              </div>
            </div>

            <div>
              <label htmlFor="product-description" className="label-calm">
                Description <span className="text-calm-muted">(optional)</span>
              </label>
              <textarea
                id="product-description"
                rows={4}
                placeholder="A gentle daily cleanser with green tea and aloe..."
                className={cn(
                  'w-full resize-none rounded-2xl border border-calm-sand/70 bg-white/80 px-4 py-3 text-sm text-calm-ink transition placeholder:text-calm-muted focus:border-calm-sage focus:outline-none focus:ring-2 focus:ring-calm-sage/15',
                  errors.description && 'border-[#B8674F]/55',
                )}
                {...register('description')}
              />
              {errors.description ? (
                <p className="mt-1.5 text-[11px] text-[#A15842]">
                  {errors.description.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-calm-sand/35 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeForm}
              disabled={isSubmitting || isPreparingImage}
              className="btn-calm-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isPreparingImage}
              className="btn-calm"
            >
              {isSubmitting ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : editingProduct ? (
                <Pencil size={14} />
              ) : (
                <Plus size={15} />
              )}
              {isSubmitting
                ? 'Saving'
                : editingProduct
                  ? 'Save changes'
                  : 'Add product'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove this product?"
        description={
          deleteTarget
            ? `${deleteTarget.name} will disappear from the storefront and free one catalog slot. This cannot be undone from the console.`
            : ''
        }
        confirmLabel="Remove product"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        isBusy={isDeleting}
        destructive
      />
    </div>
  );
}
