﻿using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using MEDIA = System.Windows.Media;
using DataManagementSystem;
using Microsoft.Win32;

namespace Gauge_Generator
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            Global.SetSidebarObject(sidebar_frame, sidebar_title);
            Global.ScreenCanvas = preview;
            MEDIA.Animation.Timeline.DesiredFrameRateProperty.OverrideMetadata(typeof(MEDIA.Animation.Timeline), new FrameworkPropertyMetadata { DefaultValue = 15 });
        }
        
        private void Preview_SizeChanged(object sender, SizeChangedEventArgs e)
        {
            double w = e.NewSize.Width - 20;
            double h = e.NewSize.Height - 20;
            preview.Width = Math.Min(w, h);
            preview.Height = Math.Min(w, h);
            Global.RefreshScreen();
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            Global.FileStateChanged += FSC;
            Global.LoadProject("", false);
            FSC(false, "");
            //TODO diagnostic code
            //Global.project.layers.Add(new NumericScale_Item());
            //Global.project.layers.Add(new Range_Item());
            //Global.project.layers[0].SetRangeSource((Range_Item)Global.project.layers[1]);
            //Global.EditingLayer = Global.project.layers[0];
            //Global.SetSidebar(Global.SidebarPages.Editor);
            //Global.SetSidebar(Global.SidebarPages.Layers);
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            if(Global.dms.FileChanged)
            {
                switch(MessageBox.Show("The current project has unsaved changes. Do you want to save them?", "Unsaved changes", MessageBoxButton.YesNoCancel, MessageBoxImage.Exclamation, MessageBoxResult.Yes))
                {
                    case MessageBoxResult.Yes:
                        Button_Save(sender, new RoutedEventArgs());
                        break;
                    case MessageBoxResult.No:
                        //ok
                        break;
                    default:
                        e.Cancel = true;
                        break;
                }
            }
        }

        private void FSC(bool changes, string path)
        {
            string s = changes ? "* " : "";
            if(path == "")
            {
                s += "Empty project";
            }
            else
            {
                try { s += new System.IO.FileInfo(path).Name; } catch { }
            }
            Title = s + " - Gauge Generator";
        }

        private void Button_New(object sender, RoutedEventArgs e)
        {
            if(Global.dms != null && Global.dms.FileChanged)
            {
                switch (MessageBox.Show("The current project has unsaved changes. Do you want to save them?", "Unsaved changes", MessageBoxButton.YesNoCancel, MessageBoxImage.Exclamation, MessageBoxResult.Yes))
                {
                    case MessageBoxResult.Yes:
                        Button_Save(sender, new RoutedEventArgs());
                        break;
                    case MessageBoxResult.No:
                        //ok
                        break;
                    default:
                        return;
                }
            }
            Global.LoadProject("", false);
        }

        private void Button_Open(object sender, RoutedEventArgs e)
        {
            if (Global.dms != null && Global.dms.FileChanged)
            {
                switch (MessageBox.Show("The current project has unsaved changes. Do you want to save them?", "Unsaved changes", MessageBoxButton.YesNoCancel, MessageBoxImage.Exclamation, MessageBoxResult.Yes))
                {
                    case MessageBoxResult.Yes:
                        Button_Save(sender, new RoutedEventArgs());
                        break;
                    case MessageBoxResult.No:
                        //ok
                        break;
                    default:
                        return;
                }
            }
            OpenFileDialog opn = new OpenFileDialog
            {
                Multiselect = false,
                Filter = "Gauge Generator Project (*.ggp)|*.ggp"
            };
            if ((bool)opn.ShowDialog()) Global.LoadProject(opn.FileName, false);
        }

        private void Button_Save(object sender, RoutedEventArgs e)
        {
            if(Global.dms.PathToFile == "")
            {
                Button_SaveAs(sender, new RoutedEventArgs());
            }
            else
            {
                if (!Global.dms.FileChanged) return;
                if (Global.Sidebar == Global.SidebarPages.Editor)
                {
                    foreach (Layer i in Global.project.layers)
                    {
                        if (i.RangeSource == Global.EditingLayer) i.ValidateWithSource();
                    }
                }
                if (!Global.dms.SaveChanges()) MessageBox.Show("File error. The project has not been saved", "Error", MessageBoxButton.OK, MessageBoxImage.Error, MessageBoxResult.OK);
            }
        }

        private void Button_SaveAs(object sender, RoutedEventArgs e)
        {
            SaveFileDialog sve = new SaveFileDialog
            {
                Filter = "Gauge Generator Project (*.ggp)|*.ggp"
            };
            if((bool)sve.ShowDialog())
            {
                if (Global.Sidebar == Global.SidebarPages.Editor)
                {
                    foreach (Layer i in Global.project.layers)
                    {
                        if (i.RangeSource == Global.EditingLayer) i.ValidateWithSource();
                    }
                }
                if (!Global.dms.SaveAs(sve.FileName)) MessageBox.Show("File error. The project has not been saved", "Error", MessageBoxButton.OK, MessageBoxImage.Error, MessageBoxResult.OK);
            }
        }
    }
}
