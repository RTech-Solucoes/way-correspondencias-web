import { Calendar } from "@phosphor-icons/react";
import { CaretUp, CaretDown } from "@phosphor-icons/react";

interface IFilterCalendarYearProps {
    year: number;
    navigateYear: (direction: 'prev' | 'next') => void;
}

export default function FilterCalendarYear(props: IFilterCalendarYearProps) {
    return (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                        {props.year}
                    </h3>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => props.navigateYear('prev')}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                    title="Ano anterior"
                >
                    <CaretUp className="h-4 w-4 text-gray-600" />
                </button>

                <button
                    onClick={() => props.navigateYear('next')}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                    title="Próximo ano"
                >
                    <CaretDown className="h-4 w-4 text-gray-600" />
                </button>
            </div>
        </div>
    )
}
