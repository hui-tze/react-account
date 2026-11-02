import {useEffect, useState} from "react";
import {Form} from "react-bootstrap";
import {Search} from "react-feather";

type SearchBoxProps = {
    value: string,
    onChange: (value: string) => void,
    placeholder: string,
    // wait this long after typing stops before searching
    debounceMs?: number,
};

/** Debounced search input for list toolbars. */
export function SearchBox({value, onChange, placeholder, debounceMs = 300}: SearchBoxProps) {
    const [text, setText] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (text !== value) {
                onChange(text.trim());
            }
        }, debounceMs);
        return () => clearTimeout(timer);
    }, [text, value, onChange, debounceMs]);

    return (
        <div className="position-relative" style={{maxWidth: 360}}>
            <Search size={16} className="position-absolute text-muted" style={{left: 12, top: "50%", transform: "translateY(-50%)"}} />
            <Form.Control
                type="search"
                value={text}
                placeholder={placeholder}
                aria-label={placeholder}
                style={{paddingLeft: 36}}
                onChange={(e) => setText(e.target.value)}
            />
        </div>
    );
}
