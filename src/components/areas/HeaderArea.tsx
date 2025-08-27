import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import PageTitle from "../ui/page-title";
import { Dispatch, SetStateAction } from "react";
import { AreaResponse } from "@/api/areas/types";

interface IHeaderArea {
    setSelectedArea: Dispatch<SetStateAction<AreaResponse | null>>;
    setShowAreaModal: Dispatch<SetStateAction<boolean>>;
}

export default function HeaderArea(props: IHeaderArea) {
    return (
        <div className="flex items-start justify-between mb-4">
            <PageTitle />
            {/*<Button onClick={() => {*/}
            {/*    props.setSelectedArea(null);*/}
            {/*    props.setShowAreaModal(true);*/}
            {/*}} className="bg-primary hover:bg-blue-700">*/}
            {/*    <PlusIcon className="h-4 w-4 mr-2" />*/}
            {/*    Nova Área*/}
            {/*</Button>*/}
        </div>
    )
}