import { supabase, type CmsContent } from './supabase';

export type CmsContentMap = Record<string, Record<string, CmsContent>>;

export async function fetchCmsContent(): Promise<CmsContentMap> {
  const { data, error } = await supabase
    .from('cms_content')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to fetch CMS content:', error);
    return {};
  }

  const map: CmsContentMap = {};
  for (const item of (data as CmsContent[]) || []) {
    if (!map[item.section]) map[item.section] = {};
    map[item.section][item.key] = item;
  }
  return map;
}

export async function fetchAllCmsContent(): Promise<CmsContent[]> {
  const { data, error } = await supabase
    .from('cms_content')
    .select('*')
    .order('section', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to fetch all CMS content:', error);
    return [];
  }
  return (data as CmsContent[]) || [];
}

export async function updateCmsItem(id: string, updates: Partial<Pick<CmsContent, 'value' | 'is_visible'>>): Promise<boolean> {
  const { error } = await supabase
    .from('cms_content')
    .update(updates)
    .eq('id', id);
  return !error;
}

export async function createCmsItem(item: { section: string; key: string; value: string; is_visible: boolean; sort_order: number }): Promise<CmsContent | null> {
  const { data, error } = await supabase
    .from('cms_content')
    .insert(item)
    .select('*')
    .maybeSingle();
  if (error) {
    console.error('Failed to create CMS item:', error);
    return null;
  }
  return data as CmsContent;
}

export async function deleteCmsItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('cms_content')
    .delete()
    .eq('id', id);
  return !error;
}

export function getCmsValue(cms: CmsContentMap, section: string, key: string, fallback = ''): string {
  return cms[section]?.[key]?.value ?? fallback;
}
