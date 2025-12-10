'use client';

import Image from 'next/image';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
    const { t } = useTranslation();
    return (
        <footer className="bg-white backdrop-blur-md">
            <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
                <div className="md:flex md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <a href="" className="flex items-center">
                            <Image src="/LOGO/tooth.png" alt="FlowBite Logo" width={32} height={32} className="h-10 me-3" />
                            <span className="self-center text-2xl font-semibold whitespace-nowrap text-gray-400">HoangBinh Dental</span>
                        </a>
                    </div>
                    <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Resources</h2>
                            <ul className="text-gray-500 dark:text-gray-400 font-medium">
                                <li className="mb-4">
                                    <a href="/home" className="hover:underline">{t('Home')}</a>
                                </li>
                                <li className="mb-4">
                                    <a href="/about" className="hover:underline">{t('About')}</a>
                                </li>
                                <li className="mb-4"> 
                                    <a href="/about" className="hover:underline">{t('Services')}</a>
                                </li>
                                <li className="mb-4">
                                    <a href="/home" className="hover:underline">{t('Pricing')}</a>
                                </li>
                                <li>
                                    <a href="/suggestions" className="hover:underline">{t('Contact')}</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Follow us</h2>
                            <ul className="text-gray-500 dark:text-gray-400 font-medium">
                                <li className="mb-4">
                                    <a href="" className="hover:underline ">Facebook</a>
                                </li>
                                <li className="mb-4">
                                    <a href="" className="hover:underline">Instagram</a>
                                </li>
                                <li className="mb-4">
                                    <a href="" className="hover:underline">Twitter</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Legal</h2>
                            <ul className="text-gray-500 dark:text-gray-400 font-medium">
                                <li className="mb-4">
                                    <a href="#" className="hover:underline">Privacy Policy</a>
                                </li>
                                <li>
                                    <a href="#" className="hover:underline">Terms &amp; Conditions</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
                <div className="sm:flex sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2025 <a href="" className="hover:underline">HoangBinh Dental™</a>. All Rights Reserved.
                    </span>
                    <div className="flex mt-4 sm:justify-center sm:mt-0">
                        <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-400">
                            <span className="sr-only">Facebook page</span>
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5">
                            
                            <span className="sr-only">Discord community</span>
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5">
                            
                            <span className="sr-only">Twitter page</span>
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5">
                          
                            <span className="sr-only">GitHub account</span>
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5">
                            
                            <span className="sr-only">Dribbble account</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>

    )
}

export default Footer