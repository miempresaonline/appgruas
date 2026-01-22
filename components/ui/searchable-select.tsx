'use client';

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface Option {
    value: string
    label: string
}

interface SearchableSelectProps {
    options: Option[]
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    label: string
    disabled?: boolean
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Seleccionar...",
    label,
    disabled = false
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")

    const filteredOptions = React.useMemo(() => {
        if (!search) return options
        return options.filter((option) =>
            option.label.toLowerCase().includes(search.toLowerCase())
        )
    }, [options, search])

    const selectedLabel = options.find((Option) => Option.value === value)?.label

    const handleSelect = (val: string) => {
        onChange(val)
        setOpen(false)
        setSearch("")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                    disabled={disabled}
                >
                    {value ? selectedLabel : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DialogTrigger>
            <DialogContent className="p-0 gap-0 overflow-hidden max-w-[90vw] w-[400px] rounded-lg">
                <DialogHeader className="px-4 py-3 border-b">
                    <DialogTitle className="text-sm font-medium text-slate-500 uppercase">
                        Seleccionar {label}
                    </DialogTitle>
                </DialogHeader>
                <div className="p-2 border-b flex items-center gap-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border-0 focus-visible:ring-0 px-0 h-auto"
                        autoFocus
                    />
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                    {filteredOptions.length === 0 ? (
                        <div className="py-6 text-center text-sm text-slate-500">
                            No se encontraron resultados.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "flex items-center px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-slate-100",
                                        value === option.value && "bg-slate-100 font-medium"
                                    )}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
