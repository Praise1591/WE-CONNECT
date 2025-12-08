import React from 'react'
import './Recent.css';
import { PersonStandingIcon, OptionIcon, DotSquareIcon } from 'lucide-react';
import p2 from '/Image.jpg'

const teachers = [
    {
        image: p2,
        name: 'Damian Clarson',
        course: 'Pipline Technology (PTE411)',
        category: 'Past Question',
        school: "babcock University"
    },
    {
        image: PersonStandingIcon,
        name: 'Mahmood Bashiru',
        course: 'Antropology (ANT211)',
        category: 'Note/pdf',
        school: "Delta State University"
    },
    {
        image: PersonStandingIcon,
        name: 'Daniel Lawrence',
        course: 'Engineering Mathematics (MTH310)',
        category: 'Past Question',
        school: "Rivers State University"
    },
    {
        image: PersonStandingIcon,
        name: 'Vivian Ejiofor',
        course: 'Economics Statistics (ESC211)',
        category: 'Note/pdf',
        school: "Niger Delta University"
    },
    {
        image: PersonStandingIcon,
        name: 'Prof. Matthew Sulere',
        course: 'Biochemistry',
        category: 'Technical Reviews',
        school: "Lagos State University"
    },
    {
        image: PersonStandingIcon,
        name: 'Engr. Kola Johnson',
        course: 'Thermodynamics',
        category: 'Video Tutorial',
        school: "Delta State University"
    }
]

function Recent() {
  return (
    <div className='teacher--list  dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-r-slate-200/50 dark:border-slate-700/50 '>
        <div className="list--header">
            <h2 className='text-2xl font-black text-slate-800 dark:text-white '>Recent Uploads</h2>
        </div>
        <div className="list--container w-full px-0.5 py-0.5 text-xl bg ">
            {teachers.map((teacher) => (
                <button className='list bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50'>
                    <div className="teacher--detail ">
                        <img src={teacher.image} alt={teacher.name} className='h-13 w-2'/>
                        <h2>{teacher.name}</h2>
                    </div>
                    <span className='text-emerald-600 dark:text-emerald-400'>{teacher.course}</span>
                    <span className='text-blue-600 dark:text-blue-400'>{teacher.school}</span>
                    <span className='text-purple-600 dark:text-purple-600'>{teacher.category}</span>
                    <button className='teacher-todo text-white group-hover:scale-110 transition-all duration-300 hover:text-emerald-600 text-3xl'>:</button>
                    
                </button>
            ))}
        </div>
    </div>
  )
}

export default Recent