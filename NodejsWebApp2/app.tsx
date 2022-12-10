declare var require: any

const React = require('react');
const ReactDOM = require('react-dom/client');


const ws = new window.WebSocket('ws://localhost:1337');

function DataList(props) {
    if (props.dataArray?.length > 0) {
        return <>
            <table className="shadow table table-light table-hover table-bordered table-striped mt-5">
                <tbody>
                    {props.dataArray.map((d) => {
                        return <tr style={{ cursor: "pointer" }} key={d.id}>
                            <td>{d.name}</td>
                        </tr>
                    })}
                </tbody>
            </table>
        </>
    }
    return <></>
}


function Days(props) {
    const selectWeekday = (weekday) => {
        ws.send(JSON.stringify({ 'chosenWeekDay': weekday }));
    }
    const wait = (d) => {
        props.chosenWeekday = d;
    }
    return <>
        <div className="btn-group" role="group" aria-label="Weekdays Group">
            {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((d) => {
                return <span key={d}>
                    <input value={d} type="radio" className="btn-check" id={d} autoComplete="off" onClick={() => selectWeekday(d)} checked={props.chosenWeekday === d} onChange={() => wait(d)} />
                    <label className="btn btn-outline-dark mt-3 ms-2 shadow" htmlFor={d} style={{ minWidth: "125px !important" }}>{d}</label>
                </span>
            })}
        </div>
    </>
}

function BaseHtml(props) {
    return <>
        <h1 className="text-center">Choose your workout day</h1>
        <div className="text-center">
            <Days chosenWeekday={props.chosenWeekday} />
            <div className="mt-5 w-75 m-auto">
                <DataList dataArray={props.dataArray} />
            </div>
        </div>
    </>;
}


function App() {
    const [data, listData] = React.useState([]);
    ws.onmessage = (e) => {
        listData(JSON.parse(e.data));
        console.log(`DATA FROM WS: ${e.data}`);
    }
    React.useEffect(() => {
        if (!data.chosenWeekday)
            ws.send(JSON.stringify({ 'chosenWeekDay': new Date().toLocaleDateString('default', { weekday: 'long' }).toUpperCase() }));
    }, [])
    return (<>
        <BaseHtml dataArray={data.data} chosenWeekday={data.chosenWeekDay} />
    </>);
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />);

