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
        const string DMS_ID = "GaugeGen";
        DMS<ProjectData> dms = new DMS<ProjectData>(DMS_ID, ref Global.project, "");

        public MainWindow()
        {
            InitializeComponent();
            Global.SetSidebarObject(sidebar_frame, sidebar_title);
            Global.SetSidebar(Global.SidebarPages.Layers);
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
            //TODO diagnostic code
            //Global.project.layers.Add(new NumericScale_Item());
            //Global.project.layers.Add(new Range_Item());
            //Global.project.layers[0].SetRangeSource((Range_Item)Global.project.layers[1]);
            //Global.EditingLayer = Global.project.layers[0];
            //Global.SetSidebar(Global.SidebarPages.Editor);
            //Global.SetSidebar(Global.SidebarPages.Layers);
        }

        public void LoadProject(string path, bool tempfile)
        {
            dms = new DMS<ProjectData>(DMS_ID, ref Global.project, path);
            if (path != "" && System.IO.File.Exists(path))
            {
                if(tempfile)
                {
                    dms.LoadFileAndClearPath();
                }
                else
                {
                    dms.LoadFromSource();
                }
            }
            Global.EditingLayer = null;
            Global.SetSidebar(Global.SidebarPages.Layers);
        }

        private void Button_New(object sender, RoutedEventArgs e)
        {
            if(dms != null && dms.FileChanged)
            {
                if (MessageBox.Show("The current project has unsaved changes. Do you want to continue?", "Unsaved changes", MessageBoxButton.YesNo, MessageBoxImage.Exclamation, MessageBoxResult.Yes) != MessageBoxResult.Yes) return;
            }
            LoadProject("", false);
        }

        private void Button_Open(object sender, RoutedEventArgs e)
        {
            if (dms != null && dms.FileChanged)
            {
                if (MessageBox.Show("The current project has unsaved changes. Do you want to continue?", "Unsaved changes", MessageBoxButton.YesNo, MessageBoxImage.Exclamation, MessageBoxResult.Yes) != MessageBoxResult.Yes) return;
            }
            OpenFileDialog opn = new OpenFileDialog
            {
                Multiselect = false,
                Filter = "Gauge Generator Project (*.ggp)|*.ggp"
            };
            if ((bool)opn.ShowDialog()) LoadProject(opn.FileName, false);
        }

        private void Button_Save(object sender, RoutedEventArgs e)
        {
            if(dms.PathToFile == "")
            {
                Button_SaveAs(sender, new RoutedEventArgs());
            }
            else
            {
                if (!dms.SaveChanges()) MessageBox.Show("File error. The project has not been saved", "Error", MessageBoxButton.OK, MessageBoxImage.Error, MessageBoxResult.OK);
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
                if (!dms.SaveAs(sve.FileName)) MessageBox.Show("File error. The project has not been saved", "Error", MessageBoxButton.OK, MessageBoxImage.Error, MessageBoxResult.OK);
            }
        }
    }
}
