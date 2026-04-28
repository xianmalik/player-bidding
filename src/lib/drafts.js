import { createClient } from './supabaseClient';

/**
 * Fetch all drafts for a specific user
 * @param {string} userId - The user ID to fetch drafts for
 * @returns {Promise<Array>} Array of draft objects
 */
export async function getUserDrafts(userId) {
    if (!userId) {
        console.warn('No user ID provided to getUserDrafts');
        return [];
    }

    try {
        const supabase = createClient();
        
        const { data, error } = await supabase
            .from('drafts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user drafts:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching user drafts:', error);
        return [];
    }
}

/**
 * Transform draft data from Supabase format to modal format
 * @param {Array} drafts - Raw drafts from Supabase
 * @returns {Array} Transformed drafts for modal display
 */
export function transformDraftsForModal(drafts) {
    return drafts.map(draft => {
        const draftData = draft.draft_data || {};
        
        // Extract champions from blue and red arrays, filtering out null values
        const blueTeamChamps = (draftData.blue || [])
            .filter(champ => champ && champ.id)
            .map(champ => champ.id);
            
        const redTeamChamps = (draftData.red || [])
            .filter(champ => champ && champ.id)
            .map(champ => champ.id);
        
        return {
            id: draft.id,
            name: draft.name || `Draft ${new Date(draft.created_at).toLocaleDateString()}`,
            createdAt: draft.created_at,
            isPublic: draft.is_public || false,
            blueTeam: {
                name: draftData.blueTeamName || 'Blue Team',
                champions: blueTeamChamps
            },
            redTeam: {
                name: draftData.redTeamName || 'Red Team', 
                champions: redTeamChamps
            }
        };
    });
}
