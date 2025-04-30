import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCirclePlus, faFileImport, faGear, faHome, faMicrochip } from '@fortawesome/free-solid-svg-icons';

import Tippy from '@tippyjs/react';
import { NavbarButton, NavbarContainer, NavbarHeader, NavbarSection } from './styles';
import { get } from '../../utils/requests';

const Navbar: React.FC = () => {
    const [hasGpu, setHasGpu] = useState<boolean>(false);
    const [gpuDevice, setGpuDevice] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkGpuStatus = async () => {
            try {
                const response = await get<{ has_gpu: boolean; device: string | null }>('/gpu-check');
                if (response.success) {
                    setHasGpu(response.data.has_gpu);
                    setGpuDevice(response.data.device);
                } else {
                    console.error('Failed to check GPU status:', response.error);
                    setHasGpu(false);
                    setGpuDevice(null);
                }
            } catch (error) {
                console.error('Failed to check GPU status:', error);
                setHasGpu(false);
                setGpuDevice(null);
            }
        };

        checkGpuStatus();
    }, []);

    const upload = useCallback(async () => {
        const fileInput = document.createElement('input')
        fileInput.type = 'file'
        fileInput.webkitdirectory = true
        fileInput.click()

        const promise = new Promise((resolve, reject) => {
            fileInput.onchange = async (ev) => {
                // @ts-ignore
                const files = Array.from(ev.target.files);
                // @ts-ignore
                const configPath = files.length > 0 ? files.find((file) => file.name === 'config.yaml')?.path : null
                if (!configPath) {
                    const mainError = "No config.yaml file found in the selected directory."
                    window.alert(`${mainError} \n\nPlease select a valid VAME project.`)
                    return reject(mainError)
                }

                resolve(configPath)
            }
        })

        const project = await promise

        navigate({
            pathname: "/project",
            search: `?path=${project}`
        });
    }, [])

    return (
        <NavbarContainer>
            <NavbarSection>
                <NavbarHeader to="/">VAME Desktop</NavbarHeader>
            </NavbarSection>
            <NavbarSection>
                <Link to="/">
                    <Tippy content={<span>Home page</span>}>
                        <span>
                            <NavbarButton>
                                <FontAwesomeIcon icon={faHome} />
                            </NavbarButton>
                        </span>
                    </Tippy>
                </Link>
                <Link to="/create">
                    <Tippy content={<span>Create a new project</span>}>
                        <span>
                            <NavbarButton>
                                <FontAwesomeIcon icon={faFileCirclePlus} />
                            </NavbarButton>
                        </span>
                    </Tippy>
                </Link>
                <Tippy content={<span>Load an external project</span>}>
                    <span>
                        <NavbarButton onClick={upload}>
                            <FontAwesomeIcon icon={faFileImport} />
                        </NavbarButton>
                    </span>
                </Tippy>
                <Link to="/settings">
                    <Tippy content={<span>Edit global settings</span>}>
                        <span>
                            <NavbarButton>
                                <FontAwesomeIcon icon={faGear} />
                            </NavbarButton>
                        </span>
                    </Tippy>
                </Link>
                <Tippy content={<span>{hasGpu ? `GPU: ${gpuDevice}` : 'No GPU detected'}</span>}>
                    <span>
                        <NavbarButton
                            style={{
                                background: hasGpu ? '#28a745' : '#dc3545',
                                cursor: 'default'
                            }}
                        >
                            <FontAwesomeIcon icon={faMicrochip} />
                        </NavbarButton>
                    </span>
                </Tippy>
            </NavbarSection>
        </NavbarContainer>
    );
}

export default Navbar;
