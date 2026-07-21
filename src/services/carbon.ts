import { supabase } from "@/lib/supabase";


export async function getCarbonSummary(
    documentId: string
) {

    const { data, error } = await supabase.rpc(
        "get_carbon_summary",
        {
            doc_id: documentId,
        }
    );


    if (error) {

        console.error(
            "Failed to fetch carbon summary:",
            error
        );

        throw error;
    }


    return data;

}