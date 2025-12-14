import React, { useEffect, useState } from 'react'

function SchoolSearch({options}) {

  const [searchText, setSearchText] = useState("");
  const [filterOptions, setFilterOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const setOption = (value) => {
    if(selectedOptions.includes(value)){
      const opts= selectedOptions.filter(item=>item !== value);
      setSelectedOptions([...opts])
    }
    else{
      setSelectedOptions([...selectedOptions.value])
    }
  }

  useEffect(() => {
    const match = options.filter(item => item?.value.toLowerCase().includes(searchText?.toLowerCase()));
    if(match){
      setFilterOptions(match)
    } else{
      setFilterOptions(options)
    }
  }, [searchText])

  return (
    <div className='border border-b-gray-200 rounded-md p-6'>
      
      <div>
        <div>
          {JSON.stringify(selectedOptions)}
        </div>
        <input type="text" placeholder='Search' className='py-2 px-4 w-full outline-none' onKeyUp={(e)=>setSearchText(e.target.value)}/>
      </div>
      <div className="flex flex-col gap-2 border-t-2 border-gray-400 py-10 max-h-[300px] overflow-y-auto">
        {
          filterOptions.map(option =>{
            return(
              <div key={option.value} className="flex items-center gap-2 hover:bg-gray-200 cursor-pointer p-2" onClick={() => setOption(option.value)}>
                <input type="checkbox" checked={selectedOptions.includes(option.value)}/>
                {option.label}
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default SchoolSearch