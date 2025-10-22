import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { message } from 'antd';
import { CategoryType } from '../types/category.types';
import { BrandType } from '../types/brand.types';
import { SupplierType } from '../types/supplier.types';
import { SubcategoryType } from '../types/subcategory.types';
import { UOMType } from '../types/uom.types';

interface MasterDataState {
  categories: CategoryType[];
  brands: BrandType[];
  suppliers: SupplierType[];
  subcategories: SubcategoryType[];
  uoms: UOMType[];
  loading: boolean;
  error: string | null;
}

const initialState: MasterDataState = {
  categories: [],
  brands: [],
  suppliers: [],
  subcategories: [],
  uoms: [],
  loading: false,
  error: null,
};

// Async thunks for fetching data
export const fetchCategories = createAsyncThunk(
  'masterData/fetchCategories',
  async () => {
    const response = await fetch('http://localhost:8000/categories/list');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  }
);

export const fetchBrands = createAsyncThunk(
  'masterData/fetchBrands',
  async () => {
    const response = await fetch('http://localhost:8000/brands/list');
    if (!response.ok) {
      throw new Error('Failed to fetch brands');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  }
);

export const fetchSuppliers = createAsyncThunk(
  'masterData/fetchSuppliers',
  async () => {
    const response = await fetch('http://localhost:8000/suppliers/list');
    if (!response.ok) {
      throw new Error('Failed to fetch suppliers');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  }
);

export const fetchSubcategories = createAsyncThunk(
  'masterData/fetchSubcategories',
  async (categoryId?: number) => {
    const url = categoryId
      ? `http://localhost:8000/subcategories/list?categoryId=${categoryId}`
      : 'http://localhost:8000/subcategories/list';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch subcategories');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  }
);

export const fetchUOMs = createAsyncThunk(
  'masterData/fetchUOMs',
  async () => {
    const response = await fetch('http://localhost:8000/shared/uom');
    if (!response.ok) {
      throw new Error('Failed to fetch UOMs');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  }
);

export const refreshAllData = createAsyncThunk(
  'masterData/refreshAll',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchCategories()),
      dispatch(fetchBrands()),
      dispatch(fetchSuppliers()),
    ]);
  }
);

const masterDataSlice = createSlice({
  name: 'masterData',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
        message.error('Failed to load categories');
      })
      // Fetch Brands
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload;
        state.error = null;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch brands';
        message.error('Failed to load brands');
      })
      // Fetch Suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
        state.error = null;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch suppliers';
        message.error('Failed to load suppliers');
      })
      // Fetch Subcategories
      .addCase(fetchSubcategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subcategories = action.payload;
        state.error = null;
      })
      .addCase(fetchSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch subcategories';
        message.error('Failed to load subcategories');
      })
      // Fetch UOMs
      .addCase(fetchUOMs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUOMs.fulfilled, (state, action) => {
        state.loading = false;
        state.uoms = action.payload;
        state.error = null;
      })
      .addCase(fetchUOMs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch UOMs';
        message.error('Failed to load UOMs');
      })
      // Refresh All
      .addCase(refreshAllData.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshAllData.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(refreshAllData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to refresh data';
      });
  },
});

export const { clearError } = masterDataSlice.actions;
export default masterDataSlice.reducer;
